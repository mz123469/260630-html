// routes/cds-hooks.js
// CDS Hooks 2.0（https://cds-hooks.hl7.org/2.0/）
//   GET  /cds-services                        Discovery：服務清單
//   POST /cds-services/patient-triage-service patient-view hook：讀最新一筆 AI 分流，回 { cards }
// EHR 有給 prefetch 就用；沒給就自己去 fhirServer 查（規格要求兩種都要能處理）。
const crypto = require('crypto');
const router = require('express').Router();
const { fhirClient, FHIR_BASE_URL } = require('../services/fhirClient');
const { TRIAGE_CODE, FHIR_ID, buildTask, buildAppointment } = require('../services/twcoreResources');
const rateLimit = require('../services/rateLimit');

const SERVICE_ID = 'patient-triage-service';
const URGENCY = TRIAGE_CODE.urgency;
const URGENCY_TOKEN = `${URGENCY.system}|${URGENCY.code}`;

// 門檻：>= 5 warning、>= 8 critical；分數低但 AI 標了需人工介入也給 warning。LINE 門檻另在 routes/triage.js。
const WARNING_SCORE = 5;
const CRITICAL_SCORE = 8;

// 只查信任的 FHIR Server（白帽測試 C1：防止被拿去打內網，SSRF）
const TRUSTED = [FHIR_BASE_URL, ...(process.env.CDS_TRUSTED_FHIR_SERVERS || '').split(',')]
    .map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);

const asArray = (v) => (Array.isArray(v) ? v : []);
const asText = (v) => (typeof v === 'string' ? v : '');

// 卡片 detail 是 Markdown，EHR 會渲染。AI 摘要來自病人自述，先跳脫 HTML 與 Markdown 連結符號（白帽測試 C2）
const md = (s) => asText(s).replace(/[<>&[\]()`*_]/g, (c) => `\\${c}`);
// 給人看的時間：台灣時區、到分鐘；格式不對就原樣顯示
const when = (t) => Number.isNaN(Date.parse(t)) ? String(t || '時間不明')
    : new Date(t).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

// 卡片必填：summary（≤140 字）、indicator、source.label；uuid 給 EHR 回饋用；suggestions 是醫師可一鍵接受的建議
function card(summary, indicator, detail, suggestions) {
    return {
        uuid: crypto.randomUUID(),
        summary: summary.slice(0, 140),
        indicator,
        detail,
        source: { label: 'AI Triage System', topic: { system: URGENCY.system, code: URGENCY.code, display: URGENCY.display } },
        ...(suggestions?.length ? { suggestions } : {})
    };
}

// 建議（CDS Hooks 2.0 suggestion）：actions[0].resource 是標準欄位，任何 EHR 都能自己建；
// extension 是給本專案前端用的捷徑（只送 id 到後端重組，不轉送資源本體）
const ACCEPT_EXT = 'http://example.org/fhir/ai-triage/accept';
function suggestion(label, type, input) {
    const resource = (type === 'Task' ? buildTask : buildAppointment)(input);
    return {
        label, uuid: crypto.randomUUID(), isRecommended: true,
        actions: [{ type: 'create', description: `${label}（${type}）`, resource }],
        extension: { [ACCEPT_EXT]: { endpoint: `/api/twcore/${type.toLowerCase()}`, body: input } }
    };
}
// 負責醫師：優先用病人資料上的 generalPractitioner（主治醫師），沒有就用 EHR 給的 context.userId
const refId = (reference, type) => { const [t, id] = asText(reference).split('/'); return t === type && FHIR_ID.test(id || '') ? id : undefined; };

router.get('/', (req, res) => {
    res.json({
        services: [{
            hook: 'patient-view',
            id: SERVICE_ID,
            title: 'AI 智能檢傷與初步評估系統',
            description: '讀取病人最新一筆 AI 分流評估（TW Core 篩檢與評估 Observation），依急迫性分數與是否需人工介入回傳建議卡片。',
            prefetch: {
                patient: 'Patient/{{context.patientId}}',
                // subject 鎖病人、code 鎖同一種 Observation、_sort=-date 取最新、_count=1 只要一筆
                triageObservation: `Observation?subject=Patient/{{context.patientId}}&code=${encodeURIComponent(URGENCY_TOKEN)}&_sort=-date&_count=1`
            }
        }]
    });
});

// 沒有 prefetch 時自己查最新一筆
async function queryLatest(body, patientId) {
    const asked = asText(body.fhirServer).replace(/\/+$/, '');
    const baseURL = TRUSTED.includes(asked) ? asked : FHIR_BASE_URL;
    if (asked && asked !== baseURL) console.warn(`[CDS Hook] fhirServer ${asked} 不在信任清單，改查 ${baseURL}`);
    const headers = { 'Cache-Control': 'no-cache' }; // HAPI 會快取 60 秒內相同查詢，不加會讀不到剛寫的那筆
    const token = asText(body.fhirAuthorization?.access_token);
    if (token) headers.Authorization = `Bearer ${token}`;
    const r = await fhirClient.get('/Observation', { baseURL, headers, params: { subject: `Patient/${patientId}`, code: URGENCY_TOKEN, _sort: '-date', _count: 1 } });
    if (r.data?.resourceType !== 'Bundle') throw new Error('FHIR Server 回的不是 Bundle'); // 回 HTML／OperationOutcome 時不能顯示成「尚無紀錄」
    return r.data;
}

// 確認是「這位病人」的「AI 分流」Observation，不是隨便塞進來的資料（白帽測試 C2、C3、C4）
function isTriageFor(obs, patientId) {
    return obs?.resourceType === 'Observation'
        && obs.subject?.reference === `Patient/${patientId}`
        && asArray(obs.code?.coding).some(c => c?.system === URGENCY.system && c?.code === URGENCY.code);
}

// 每個來源每分鐘最多 60 次：每次呼叫都會去查 FHIR Server（白帽第三輪）
router.post(`/${SERVICE_ID}`, rateLimit({ max: 60, message: '呼叫太頻繁，請一分鐘後再試' }), async (req, res) => {
    const body = req.body || {};
    const patientId = body.context?.patientId;
    if (body.hook !== 'patient-view' || !asText(body.hookInstance)) {
        return res.status(400).json({ error: '請求要帶 hook: "patient-view" 與 hookInstance' });
    }
    if (!FHIR_ID.test(asText(patientId))) {
        return res.status(400).json({ error: 'context.patientId 缺少或格式不對' });
    }
    console.log(`[CDS Hook] 醫師正在查看病人: ${patientId}`);

    let bundle = body.prefetch?.triageObservation;
    try {
        if (bundle?.resourceType !== 'Bundle') bundle = await queryLatest(body, patientId); // prefetch 沒給或格式不對就自己查
    } catch (error) {
        console.error('FHIR 查詢錯誤:', error.message);
        return res.status(502).json({ error: 'FHIR 查詢失敗，無法產生分流建議' }); // 查不到不能顯示成沒事
    }

    const obs = asArray(bundle.entry)[0]?.resource;
    if (!obs) return res.json({ cards: [card('尚無 AI 分流紀錄', 'info', '目前查無資料，不能據此判斷病人狀況。')] });

    const score = obs.valueQuantity?.value;
    if (!isTriageFor(obs, patientId) || !Number.isInteger(score) || score < 1 || score > 10) {
        return res.json({ cards: [card('最新 AI 評估資料無法判讀', 'warning', '請人工核對原始資料，不得視為低風險。')] });
    }

    const component = (code) => asArray(obs.component).find(c => asArray(c?.code?.coding).some(cd => cd?.code === code));
    const needsHuman = component(TRIAGE_CODE.needsHuman.code)?.valueBoolean === true;
    const emotion = asText(component(TRIAGE_CODE.emotion.code)?.valueString);
    // note 存的是 "AI Summary: …"、"Symptoms: …"；卡片上改成中文標題，只取冒號後的內容
    const note = (prefix) => asText(asArray(obs.note).find(n => asText(n?.text).startsWith(prefix))?.text).slice(prefix.length).trim();
    const detail = [`AI 摘要：${md(note('AI Summary:') || '無')}`, `症狀：${md(note('Symptoms:') || '無')}`, emotion && `情緒：${md(emotion)}`, `記錄時間：${md(when(obs.effectiveDateTime))}（Observation/${md(obs.id)}）`]
        .filter(Boolean).join('\n\n');
    console.log(`[CDS Hook] 找到最新評估，分數: ${score}，需人工介入: ${needsHuman}`);

    // 建議按鈕要用的 id：緊急 → 轉介單（Task）；注意 → 排回診（Appointment）
    const practitionerId = refId(asArray(body.prefetch?.patient?.generalPractitioner)[0]?.reference, 'Practitioner') || refId(body.context?.userId, 'Practitioner');
    const input = { patientId, observationId: obs.id, practitionerId, reason: note('AI Summary:').slice(0, 200) };

    let result;
    if (score >= CRITICAL_SCORE) {
        result = card(`高風險警示（分數 ${score}）`, 'critical', `${detail}\n\nAI 分數僅供參考，由醫護人員確認。`, [suggestion('建立轉介單', 'Task', input)]);
    } else if (score >= WARNING_SCORE) {
        result = card(`需留意（分數 ${score}）`, 'warning', `${detail}\n\nAI 分數僅供參考，由醫護人員確認。`, [suggestion('排回診', 'Appointment', input)]);
    } else if (needsHuman) {
        result = card(`AI 建議人工介入（分數 ${score}）`, 'warning', `${detail}\n\n分數不高，但 AI 標記需要人工介入，請醫護人員確認。`, [suggestion('排回診', 'Appointment', input)]);
    } else {
        result = card(`AI 暫無高優先提示（分數 ${score}）`, 'info', `${detail}\n\n低分不代表已排除風險，仍需由醫護確認。`); // 不寫「穩定」
    }
    res.json({ cards: [result] });
});

// Feedback（CDS Hooks 2.0 §Feedback）：EHR 告訴服務醫師接受了哪個建議。只記錄，不改資料
router.post(`/${SERVICE_ID}/feedback`, (req, res) => {
    for (const f of asArray(req.body?.feedback)) {
        const accepted = asArray(f?.acceptedSuggestions).map(s => asText(s?.id)).filter(Boolean);
        console.log(`[CDS Hook] feedback：卡片 ${asText(f?.card)} ${asText(f?.outcome)}${accepted.length ? `，接受建議 ${accepted.join(', ')}` : ''}`);
    }
    res.json({});
});

module.exports = router;
