// routes/fhirfox.js
// 聯測松 Track 1「匯入聯測 JSON」：FHIRfox Simplified JSON → TW Core 1.0.0 Bundle → 驗證 → 上傳。
//   POST /convert  只轉換（不碰 FHIR Server）：回 Bundle、每筆來源對到哪筆 FHIR、轉換問題
//   POST /validate 轉換＋官方 validator_cli（TW Core 1.0.0）驗整份 Bundle
//   POST /upload   轉換＋驗證，Error = 0 才以 transaction Bundle 上傳；一律 POST，不更新既有資源
//   GET  /sample   範例輸入（OPD-007 感冒門診的格式，另加一筆 Procedure）
const express = require('express');
const router = express.Router();
const { fhirClient, FHIR_BASE_URL, summarizeOutcome } = require('../services/fhirClient');
const { convert, toTransaction } = require('../services/fhirfoxConverter');
const { validateBundle, IG } = require('../services/twcoreValidator');
const { FHIR_ID } = require('../services/twcoreResources');
const rateLimit = require('../services/rateLimit');
const sample = require('../fhir/fhirfox-sample.json');

const isError = (i) => ['error', 'fatal'].includes(i.severity);
// 對照表：第幾筆來源 → 哪一筆 FHIR（畫面左右對照用）
const mapOf = (entries) => entries.map(e => ({ index: e.index, sourceType: e.sourceType, sourceId: e.sourceId, resourceType: e.resource.resourceType, fullUrl: e.fullUrl, profile: e.resource.meta?.profile?.[0] || '' }));

// validator 的位置是 Bundle.entry[3].resource/*Patient/null*/.identifier[1]：換成「[來源第幾筆] 型別/id.identifier[1]」，使用者才找得到
function locate(issues, entries) {
    return issues.map(i => {
        const m = /^Bundle\.entry\[(\d+)\]\.resource(?:\/\*[^*]*\*\/)?\.?(.*)$/.exec(i.location);
        const e = m && entries[Number(m[1])];
        return e ? { ...i, location: `[${e.index}] ${e.sourceType}/${e.sourceId}${m[2] ? `.${m[2]}` : ''}` } : i;
    });
}

// 轉換＋（需要時）驗證；回 { status, body }，三個端點共用
async function prepare(body, { validate }) {
    const { bundle, entries, issues } = convert(body);
    const map = mapOf(entries);
    if (!bundle || issues.some(isError)) {
        return { status: 400, body: { success: false, error: '轉換有錯，請照下面的位置修正 JSON', issues, bundle, map } };
    }
    if (!validate) return { status: 200, body: { success: true, issues, bundle, map } };
    const v = await validateBundle(bundle);
    if (!v.available) {
        return { status: 503, body: { success: false, error: `沒辦法用 ${IG} 驗證，先不上傳：${v.reason}`, issues, bundle, map } };
    }
    const all = [...issues, ...locate(v.issues, entries)];
    const errors = all.filter(isError).length;
    if (errors) return { status: 422, body: { success: false, error: `TW Core 1.0.0 驗證有 ${errors} 個 Error，先不上傳`, issues: all, bundle, map } };
    return { status: 200, body: { success: true, validated: true, issues: all, bundle, map } };
}

router.get('/sample', (req, res) => res.json(sample));

router.post('/convert', rateLimit({ max: 60 }), async (req, res) => {
    const { status, body } = await prepare(req.body, { validate: false });
    res.status(status).json(body);
});

// validator 每次約 12 秒、吃 2 GB 記憶體：每個來源每分鐘最多 6 次
router.post('/validate', rateLimit({ max: 6, message: '驗證太頻繁，請一分鐘後再試' }), async (req, res) => {
    const { status, body } = await prepare(req.body, { validate: true });
    res.status(status).json(body);
});

router.post('/upload', rateLimit({ max: 6, message: '上傳太頻繁，請一分鐘後再試' }), async (req, res) => {
    const { status, body } = await prepare(req.body, { validate: true });
    if (!body.success) return res.status(status).json(body);
    try {
        // transaction：整包一起成功或一起失敗，不會留下半套資料（FHIR R4 http.html#transaction）
        const r = await fhirClient.post('/', toTransaction(body.bundle));
        const entries = r.data?.entry;
        if (r.data?.resourceType !== 'Bundle' || r.data.type !== 'transaction-response' || entries?.length !== body.map.length) {
            return res.status(502).json({ success: false, error: 'FHIR Server 回應不是對應的 transaction-response，無法確認有沒有上傳成功', issues: summarizeOutcome(r.data) });
        }
        // response.location 例如 Patient/123/_history/1；201＝新建，200＝伺服器上已有同一個識別碼，沿用
        const created = body.map.map((m, i) => {
            const [type, id] = String(entries[i]?.response?.location || '').split('/');
            const ok = type === m.resourceType && FHIR_ID.test(id || '') && /^20[01]/.test(entries[i]?.response?.status || '');
            return { ...m, id: ok ? id : '', status: entries[i]?.response?.status || '', reused: /^200/.test(entries[i]?.response?.status || ''), url: ok ? `${FHIR_BASE_URL}/${type}/${id}` : '' };
        });
        // 白帽第五輪 Q4：伺服器回 2xx 但位置是亂的（型別不符、id 帶 <script>）：不能當成功，也不能把位置顯示出來
        if (created.some(c => !c.url)) {
            return res.status(502).json({ success: false, error: 'FHIR Server 回應的資源位置不正確，無法確認寫入了哪些資源，請到伺服器確認', issues: [] });
        }
        res.status(200).json({ success: true, issues: body.issues, map: created, patientId: created.find(c => c.resourceType === 'Patient')?.id || '', organizationId: created.find(c => c.resourceType === 'Organization')?.id || '' });
    } catch (e) {
        // 逾時與 5xx：照 transaction 規定應該整包不寫入，但我們沒辦法確認，就照實說（白帽第五輪 Q5、Q6）
        if (e.code === 'ECONNABORTED') return res.status(504).json({ success: false, error: 'FHIR Server 逾時沒有回應，不確定有沒有寫入，請到伺服器確認後再決定要不要重送', issues: [] });
        if (!e.response) return res.status(502).json({ success: false, error: `連不到 FHIR Server（${FHIR_BASE_URL}），沒有送出任何資料`, issues: [] });
        const status = e.response.status;
        res.status(status).json({
            success: false,
            error: status < 500 ? `FHIR Server 拒絕（HTTP ${status}），整包都沒有寫入` : `FHIR Server 內部錯誤（HTTP ${status}）。transaction 規定失敗時整包不寫入，但請到伺服器確認`,
            issues: summarizeOutcome(e.response.data)
        });
    }
});

module.exports = router;
