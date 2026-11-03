// routes/triage.js
// POST /api/triage/analyze：病人自述 → AI JSON → TW Core Observation → 必要時通知醫師
const router = require('express').Router();
const { analyzePatientFeedback } = require('../services/aiService');
const { saveTriage } = require('../services/fhirService');
const { sendDoctorAlert } = require('../services/lineService');
const tw = require('../services/twcoreResources');
const { FHIR_ID } = tw;
const { fhirClient } = require('../services/fhirClient');
const rateLimit = require('../services/rateLimit');
const { ensure } = require('./twcore');

const LINE_ALERT_SCORE = 10;   // LINE 通知門檻（題目：分數 >= 10 或需人工介入）；CDS 卡片門檻在 routes/cds-hooks.js
const MAX_TEXT = 3000;

// 每個來源每分鐘最多 10 次，避免有人狂送把 Gemini 額度用光（白帽測試：無限制呼叫付費 API）
router.post('/analyze', rateLimit({ max: 10 }), async (req, res) => {
    const { patientText, patientId } = req.body || {};
    if (typeof patientText !== 'string' || !patientText.trim()) {
        return res.status(400).json({ success: false, error: '請先描述您現在的身體狀況' });
    }
    if (patientText.length > MAX_TEXT) {
        return res.status(400).json({ success: false, error: `內容請在 ${MAX_TEXT} 字以內` });
    }
    if (typeof patientId !== 'string' || !FHIR_ID.test(patientId)) {
        return res.status(400).json({ success: false, error: '請先選擇病人（到「1 建立資料」建立）' });
    }
    // 先確認病人存在，再花 AI 額度（使用者測試 U21：瀏覽器記著已被清掉的病人）
    // Patient 資源；null＝404／410；false＝連不到或回的不是 Patient（壞伺服器回 HTML 也不能當成存在）
    const patient = await fhirClient.get(`/Patient/${patientId}`)
        .then(r => (r.data?.resourceType === 'Patient' ? r.data : false), e => ([404, 410].includes(e.response?.status) ? null : false));
    if (!patient) {
        return res.status(patient === null ? 404 : 502).json({ success: false, error: patient === null
            ? '找不到這位病人，請先到「1 建立資料」建立'
            : 'FHIR 存檔失敗：連不到 FHIR Server，沒有送出分析。請稍後再試。' });
    }

    triage(patient, patientText, res);
});

// 一般使用模式：病人自己填基本資料＋主訴，一次送出。
// 後端先確認機構（官方清單）、再找或建病人（同身分證就沿用，絕不覆蓋），然後走同一條 AI 評估流程。
// 不收 id／practitionerId／update（白帽第四輪：病人端不能指定 Patient ID 或掛名醫師）
router.post('/report', rateLimit({ max: 10 }), async (req, res) => {
    const b = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const patientText = b.patientText;
    // 症狀、機構、病人欄位一次檢查完，讓畫面能同時標出所有錯的欄位，再去碰 FHIR Server
    const textIssue = (typeof patientText !== 'string' || !patientText.trim()) ? '請描述您現在的身體狀況'
        : patientText.length > MAX_TEXT ? `內容請在 ${MAX_TEXT} 字以內` : '';
    const input = { orgCode: b.orgCode, name: b.name, idCardNumber: b.idCardNumber, gender: b.gender, birthDate: b.birthDate };
    const issues = [...tw.checkOrganization(input), ...tw.checkPatient(input), ...(textIssue ? [{ location: 'patientText', message: textIssue }] : [])]
        .map(i => ({ severity: 'error', ...i }));
    if (issues.length) return res.status(400).json({ success: false, error: '有欄位要修正', issues });
    const fail = (status, body, what) => res.status(status).json({ success: false, error: `${what}：${body.error}`, issues: body.issues || [] });
    const org = await ensure.organization(input);
    if (!org.body.success) return fail(org.status, org.body, '醫療機構');
    const pat = await ensure.patient({ ...input, managingOrganizationId: org.body.id });
    if (!pat.body.success) return fail(pat.status, pat.body, '病人資料');
    triage(pat.body.resource, patientText, res, { patient_id: pat.body.id, patient_reused: Boolean(pat.body.reused) });
});

// 兩條路共用：去識別化 → AI → 安全網 → 寫三筆 → （必要時）通知 → 回應
async function triage(patient, patientText, res, extra = {}) {
    const patientId = patient.id;
    console.log(`\n--- 收到病人 (${patientId}) 回饋 ---`);
    let aiResult;
    try {
        aiResult = await analyzePatientFeedback(patientText);
    } catch (error) {
        console.error('[分流]', error.message); // 細節只留在後端，不回給前端
        return res.status(502).json({ success: false, error: 'AI 分析失敗，沒有存檔。請稍後再試，或直接聯絡醫護人員。' });
    }
    console.log('AI 分析結果:', aiResult);

    const saved = await saveTriage(aiResult, patient);
    if (!saved) {
        return res.status(502).json({ success: false, error: 'FHIR 存檔失敗。請確認這位病人已在「1 建立資料」建好，再送一次。' });
    }

    const notification = (aiResult.urgency_score >= LINE_ALERT_SCORE || aiResult.needs_human_intervention)
        ? await sendDoctorAlert(aiResult, saved.observationId)
        : { sent: false, simulated: false };

    res.json({
        success: true,
        data: aiResult,
        fhir_reference: saved.observationId,                 // 舊欄位名保留：Observation id
        encounter_id: saved.encounterId, condition_id: saved.conditionId,
        doctor_notified: Boolean(notification.sent),      // 真的送出 LINE 才是 true
        alert_simulated: Boolean(notification.simulated), // 沒設 Token 時只在終端機印模擬通知
        ...extra
    });
}

module.exports = router;
