// routes/twcore.js
// TW Core 基礎資源，照 C 聯測模擬第 21 頁的順序：1. Organization → 2. Practitioner → 3. Patient。
// 每一步：本機先檢查（擋掉第 23 頁常見錯誤）→ 送 FHIR Server → 把狀態碼、id、OperationOutcome 回給前端。
const express = require('express');
const router = express.Router();
const { fhirClient, FHIR_BASE_URL, summarizeOutcome, findByIdentifier, token } = require('../services/fhirClient');
const tw = require('../services/twcoreResources');
const codeSystem = require('../fhir/CodeSystem-ai-triage.json');
const rateLimit = require('../services/rateLimit');

// 寫入類（POST／PUT）每個來源每分鐘最多 120 次（按一次「建立」約 10 次請求）：每次都會轉成對共用 FHIR Server 的請求，不能被拿來狂打別人的伺服器（白帽第三輪）
const writeLimit = rateLimit({ max: 120, message: '建立太頻繁，請一分鐘後再試' });
router.use((req, res, next) => (req.method === 'GET' ? next() : writeLimit(req, res, next)));

// 統一的回應格式：{ success, status, id, issues[], error?, exists?, existingId?, updated?, resource }
// issues 每一筆：{ severity, location, message }，location 指出錯在哪個欄位（FHIRPath）
const localIssues = (errors) => errors.map(e => ({ severity: 'error', ...e }));
const isError = (i) => ['error', 'fatal'].includes(i.severity);
const noCache = { headers: { 'Cache-Control': 'no-cache' } }; // HAPI 會快取 60 秒內相同的讀取與查詢
const nameOf = (r) => {
    const n = r.name?.find?.(x => x.use === 'official') || r.name?.[0];
    return typeof r.name === 'string' ? r.name : n?.text || [n?.family, ...(n?.given || [])].filter(Boolean).join(' ') || '';
};

// 連不到伺服器、或伺服器拒絕：整理成同一個格式
function sendFhirError(res, e, resource) {
    if (!e.response) {
        return res.status(502).json({ success: false, error: `連不到 FHIR Server（${FHIR_BASE_URL}），請稍後再試`, issues: [], resource });
    }
    // 400 / 412 / 422：OperationOutcome 會指出哪個欄位錯
    res.status(e.response.status).json({ success: false, status: e.response.status, error: `FHIR Server 拒絕（HTTP ${e.response.status}）`, issues: summarizeOutcome(e.response.data), resource });
}

async function forward(res, request, resource) {
    try {
        const r = await request();
        res.status(r.status).json({ success: true, status: r.status, id: r.data?.id, issues: summarizeOutcome(r.data), resource: r.data });
    } catch (e) {
        sendFhirError(res, e, resource);
    }
}

// 嚴格驗收：建立前先請伺服器用 Profile 做 $validate。有 error 就不建立；warning / information 跟著結果一起顯示。
// （伺服器建立成功時只回資源本身、不回 OperationOutcome，不先驗證就看不到警告）
async function validateOnServer(resource) {
    try {
        const profile = resource.meta?.profile?.[0]; // Task／Appointment 沒有 TW Core Profile，就照 FHIR 基本定義驗
        const r = await fhirClient.post(`/${resource.resourceType}/$validate`, resource, { params: profile ? { profile } : {} });
        return summarizeOutcome(r.data);
    } catch (e) {
        if (e.response?.data?.resourceType === 'OperationOutcome') return summarizeOutcome(e.response.data); // HAPI 驗證沒過回 412
        throw e;
    }
}

// 「建立成功」的定義：伺服器回 2xx，而且 body 是同型別、id 合法的資源。
// 白帽測試（壞伺服器）：回 HTML、空 body、Bundle、id 帶 <script> 時，原本都被當成成功回給畫面
const created = (r, type) => r.data?.resourceType === type && tw.FHIR_ID.test(String(r.data.id || ''));

// 建立資源的共用流程：本機檢查 → 找有沒有同一筆 → 伺服器驗證 → 建立或更新。
//   ?check：只做本機檢查，讓畫面一次列出三種資源的所有錯（使用者測試 U05）
//   已經有同一筆：除非 body 帶 update: true（使用者在畫面上確認要更新），否則回 409 不動資料
//   dedupe(resource)：判斷「同一筆」的查詢字串（例如 identifier=…），拿來做條件式建立
//   reuse：已經有同一筆時直接沿用、不問使用者（PractitionerRole 這種「同醫師同機構」本來就只該有一筆）
//   same(existing, resource)：沿用前要核對的欄位（例如醫師登入：證書字號相同但姓名不同就不准沿用）
// createResource 回 { status, body }，給 HTTP 路由與一般使用模式（routes/triage.js 的 /report）共用
async function createResource(input, { check, build, findExisting, dedupe, reuse = false, same, checkOnly = false }) {
    input = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const resource = build(input);
    const type = resource.resourceType;
    const errors = check(input);
    if (errors.length) {
        return { status: 400, body: { success: false, status: 400, error: '有欄位要修正，還沒送到 FHIR Server', issues: localIssues(errors), resource } };
    }
    if (checkOnly) return { status: 200, body: { success: true, status: 200, checked: true, issues: [], resource } };
    // reuse: true 只是「已經有就沿用」，永遠不會覆蓋別人的資料（一般使用模式：病人回報、醫師登入）
    const reuseNow = reuse || input.reuse === true;
    try {
        const existing = await findExisting(resource);
        if (existing?.conflict) {
            return { status: 409, body: { success: false, status: 409, error: existing.conflict, issues: [], resource } };
        }
        if (existing && reuseNow) {
            if (same && !same(existing, resource)) {
                return { status: 409, body: { success: false, status: 409, error: `FHIR Server 上已有同一筆 ${type}，但內容對不上（例如姓名不同），不能沿用`, issues: [], resource } };
            }
            return { status: 200, body: { success: true, status: 200, id: existing.id, reused: true, issues: [], resource: existing } };
        }
        if (existing && input.update !== true) {
            return { status: 409, body: {
                success: false, status: 409, exists: true, existingId: existing.id, issues: [], resource,
                error: `FHIR Server 上已經有同一筆（${type}/${existing.id}）。要修改它請按「更新這筆」；不是要修改的話，請改填不同的資料`
            } };
        }
        const issues = await validateOnServer(resource);
        if (issues.some(isError)) {
            return { status: 422, body: { success: false, status: 422, error: 'FHIR Server 驗證沒過，還沒建立', issues, resource } };
        }
        const id = existing?.id || resource.id;
        // 沒有 id 就用條件式建立（If-None-Exist，FHIR R4 http.html#ccreate）：兩個人同時按「建立」，伺服器也只留一筆
        const r = id ? await fhirClient.put(`/${type}/${id}`, { ...resource, id })
            : await fhirClient.post(`/${type}`, resource, { headers: { 'If-None-Exist': dedupe(resource) } });
        if (!created(r, type)) {
            return { status: 502, body: { success: false, status: r.status, error: `FHIR Server 回應不是 ${type} 資源，無法確認有沒有建立成功`, issues: summarizeOutcome(r.data), resource } };
        }
        return { status: r.status, body: { success: true, status: r.status, id: r.data.id, updated: Boolean(existing), issues: [...issues, ...summarizeOutcome(r.data)], resource: r.data } };
    } catch (e) {
        if (!e.response) return { status: 502, body: { success: false, error: `連不到 FHIR Server（${FHIR_BASE_URL}），請稍後再試`, issues: [], resource } };
        return { status: e.response.status, body: { success: false, status: e.response.status, error: `FHIR Server 拒絕（HTTP ${e.response.status}）`, issues: summarizeOutcome(e.response.data), resource } };
    }
}
function createRoute(check, build, findExisting, dedupe, opts = {}) {
    return async (req, res) => {
        const { status, body } = await createResource(req.body, { check, build, findExisting, dedupe, ...opts, checkOnly: 'check' in req.query });
        res.status(status).json(body);
    };
}

// 用什麼判斷「同一筆」：機構看醫事機構代碼、醫師看證書字號、病人看身分證字號
const orgKey = (r) => [tw.SYSTEM.orgIdentifier, r.identifier[0].value];
const praKey = (r) => [tw.SYSTEM.medicalLicense, r.identifier.find(i => i.system === tw.SYSTEM.medicalLicense).value];
const patKey = (r) => [tw.SYSTEM.idCard, r.identifier[0].value];
const byIdentifier = (key) => (r) => `identifier=${encodeURIComponent(token(...key(r)))}`; // header 只能放 ASCII，所以 URL 編碼

router.post('/organization', createRoute(tw.checkOrganization, tw.buildOrganization,
    (r) => findByIdentifier('Organization', ...orgKey(r)), byIdentifier(orgKey)));

const PRA = { check: tw.checkPractitioner, build: tw.buildPractitioner, findExisting: (r) => findByIdentifier('Practitioner', ...praKey(r)), dedupe: byIdentifier(praKey),
    same: (a, b) => nameOf(a) === nameOf(b) }; // 醫師登入沿用既有資料時，證書字號＋姓名都要對
router.post('/practitioner', createRoute(PRA.check, PRA.build, PRA.findExisting, PRA.dedupe, { same: PRA.same }));

// 醫師職務：同一位醫師在同一家機構只留一筆（PractitionerRole 沒有自然的 identifier，用 practitioner＋organization 查）
const roleQuery = (r) => `practitioner=${r.practitioner.reference}&organization=${r.organization.reference}`;
router.post('/practitioner-role', createRoute(tw.checkPractitionerRole, tw.buildPractitionerRole, async (r) => {
    const b = (await fhirClient.get('/PractitionerRole', { ...noCache, params: { practitioner: r.practitioner.reference, organization: r.organization.reference, _count: 1 } })).data;
    return (b?.entry || []).map(e => e?.resource).find(x => x?.resourceType === 'PractitionerRole') || null;
}, roleQuery, { reuse: true }));

// 醫師接受 CDS 卡片建議：轉介單（Task）、回診（Appointment）。
// 前端只送 id，資源在後端重組，不收前端傳來的資源本體（白帽：不讓人借這個端點寫任意資源）；同一筆評估只建一次，已有就沿用。
const followKey = (r) => [tw.SYSTEM.followUp, r.identifier[0].value];
router.post('/task', createRoute(tw.checkTask, tw.buildTask, (r) => findByIdentifier('Task', ...followKey(r)), byIdentifier(followKey), { reuse: true }));
router.post('/appointment', createRoute(tw.checkAppointment, tw.buildAppointment, (r) => findByIdentifier('Appointment', ...followKey(r)), byIdentifier(followKey), { reuse: true }));

// 病人可以自訂 id。白帽測試 D2：id 已被「不同身分證」的人用掉時，就算按更新也不准覆蓋。
async function findPatient(r) {
    const idCard = r.identifier[0].value;
    const byId = r.id ? await fhirClient.get(`/Patient/${r.id}`, noCache).then(x => x.data?.resourceType === 'Patient' ? x.data : null, () => null) : null;
    if (byId && !byId.identifier?.some(i => i.system === tw.SYSTEM.idCard && i.value === idCard)) {
        return { conflict: '這個 Patient ID 已經有人用了，請換一個' };
    }
    return byId || findByIdentifier('Patient', ...patKey(r));
}
router.post('/patient', createRoute(tw.checkPatient, tw.buildPatient, findPatient, byIdentifier(patKey)));

// 一般使用模式用：已經有就沿用、沒有就建立，絕不更新。病人回報（routes/triage.js /report）用這組建機構與病人
const ensure = {
    organization: (input) => createResource(input, { check: tw.checkOrganization, build: tw.buildOrganization, findExisting: (r) => findByIdentifier('Organization', ...orgKey(r)), dedupe: byIdentifier(orgKey), reuse: true }),
    patient: (input) => createResource(input, { check: tw.checkPatient, build: tw.buildPatient, findExisting: findPatient, dedupe: byIdentifier(patKey), reuse: true })
};

// 醫事機構清單（Organization-hosp-twcore 只能用這些代碼），畫面的下拉選單從這裡拿
router.get('/organization-codes', (req, res) => res.json(tw.ORG_CODES));

// 讀一筆資源；404／410 回 null，回來的不是該型別就當伺服器壞掉（丟錯 → 502）
async function readOne(type, id) {
    const r = await fhirClient.get(`/${type}/${id}`, noCache).catch(e => { if ([404, 410].includes(e.response?.status)) return null; throw e; });
    if (r && r.data?.resourceType !== type) throw new Error(`FHIR Server 回的不是 ${type}`);
    return r?.data || null;
}
const sameServer = (url) => { try { return new URL(url).origin === new URL(FHIR_BASE_URL).origin; } catch { return false; } };
const MAX_PATIENTS = 500;

// 查某機構的所有病人：Patient?organization=（FHIR R4 標準查詢參數，對應 Patient.managingOrganization）。
// 共用測試伺服器上資料多，照 Bundle 的 next 連結翻頁；只跟同一台伺服器的連結（防 SSRF），以 id 去重，最多 500 筆。
router.get('/organization/:id/patients', async (req, res) => {
    if (!tw.FHIR_ID.test(req.params.id)) return res.status(400).json({ success: false, error: '機構 ID 格式不對' });
    try {
        const org = await readOne('Organization', req.params.id);
        if (!org) return res.status(404).json({ success: false, error: '找不到這個機構，請先到「① 建立資料」建立' });
        const patients = new Map();
        let next = { url: '/Patient', params: { organization: `Organization/${req.params.id}`, _count: 50 } };
        for (let page = 0; next && page < 10 && patients.size <= MAX_PATIENTS; page++) {
            const bundle = (await fhirClient.get(next.url, { ...noCache, params: next.params })).data;
            if (bundle?.resourceType !== 'Bundle') throw new Error('FHIR Server 回的不是 Bundle');
            for (const p of (bundle.entry || []).map(e => e?.resource)) if (p?.resourceType === 'Patient' && p.id) patients.set(p.id, p);
            const link = bundle.link?.find(l => l.relation === 'next')?.url;
            next = link && sameServer(link) ? { url: link } : null;
        }
        const list = [...patients.values()].slice(0, MAX_PATIENTS);
        res.json({
            success: true,
            organization: { id: org.id, name: nameOf(org) },
            total: list.length,
            truncated: patients.size > MAX_PATIENTS,
            patients: list.map(p => ({ id: p.id, name: nameOf(p), gender: p.gender, birthDate: p.birthDate }))
        });
    } catch (e) {
        res.status(502).json({ success: false, error: e.response ? `FHIR Server 拒絕（HTTP ${e.response.status}）` : `連不到 FHIR Server 或回應不正確（${e.message}）` });
    }
});

// 讀病人：醫師頁從這裡讀，FHIR Server 位址只在後端 .env 設一次
router.get('/patient/:id', async (req, res) => {
    if (!tw.FHIR_ID.test(req.params.id)) return res.status(400).json({ success: false, error: 'Patient ID 格式不對' });
    try {
        const pat = await readOne('Patient', req.params.id);
        if (!pat) return res.status(404).json({ success: false, error: '找不到這位病人，請先到「1 建立資料」建立' });
        res.json(pat);
    } catch (e) {
        res.status(502).json({ success: false, error: '連不到 FHIR Server 或回應不正確' });
    }
});

// 只驗證不存檔：FHIR 標準操作 [type]/$validate，帶 profile 參數照 TW Core 檢查。
// 白帽測試 B5：只收本專案會送出的四種資源，不當任意資源的轉送站。
const VALIDATABLE = ['Organization', 'Practitioner', 'PractitionerRole', 'Patient', 'Encounter', 'Condition', 'Observation', 'Task', 'Appointment'];
router.post('/validate', async (req, res) => {
    const resource = req.body;
    if (!VALIDATABLE.includes(resource?.resourceType)) {
        return res.status(400).json({ success: false, error: `只能驗證 ${VALIDATABLE.join('、')}` });
    }
    const profile = resource.meta?.profile?.[0];
    try {
        const r = await fhirClient.post(`/${resource.resourceType}/$validate`, resource, { params: profile ? { profile } : {} });
        const issues = summarizeOutcome(r.data);
        res.json({ success: !issues.some(i => ['error', 'fatal'].includes(i.severity)), status: r.status, issues });
    } catch (e) {
        res.status(e.response?.status || 502).json({ success: false, error: '驗證失敗', issues: summarizeOutcome(e.response?.data) });
    }
});

// 把自訂 CodeSystem 放上 FHIR Server，對方系統才查得到 urgency-score 等代碼的定義
router.put('/codesystem', (req, res) => forward(res, () => fhirClient.put(`/CodeSystem/${codeSystem.id}`, codeSystem), codeSystem));

module.exports = router;
module.exports.ensure = ensure;
