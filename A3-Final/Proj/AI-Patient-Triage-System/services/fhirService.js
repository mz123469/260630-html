// services/fhirService.js
// 一次病人回報寫三筆 TW Core 資源（聯測松 Track 1 Level 1 的「參考資源連結」）：
//   Encounter（這次遠距回報）→ Condition（問題，連到 Encounter）→ Observation（AI 分數，連到 Encounter）
// 前一筆失敗就停，不留半套；欄位對應寫在 services/twcoreResources.js
const { fhirClient, summarizeOutcome } = require('./fhirClient');
const { FHIR_ID, buildEncounter, buildCondition, buildTriageObservation } = require('./twcoreResources');

// 從 Patient 身上的參照拿 id（Practitioner/xxx → xxx）；型別不對或 id 不合法就不用（病人可能是別隊建的）
const refId = (reference, type) => { const [t, id] = String(reference || '').split('/'); return t === type && FHIR_ID.test(id || '') ? id : undefined; };

async function saveTriage(analysisResult, patient) {
    const now = new Date();
    const ids = { patientId: patient.id, practitionerId: refId(patient.generalPractitioner?.[0]?.reference, 'Practitioner'), organizationId: refId(patient.managingOrganization?.reference, 'Organization') };
    // 2xx 還不算成功：回來的要是同型別而且有 id（壞伺服器會回 HTML、空 body）
    const create = async (resource) => {
        const r = await fhirClient.post(`/${resource.resourceType}`, resource);
        if (r.data?.resourceType !== resource.resourceType || !r.data.id) throw new Error(`伺服器回 HTTP ${r.status} 但內容不是 ${resource.resourceType}`);
        return r.data.id;
    };
    try {
        const encounterId = await create(buildEncounter(ids, now));
        const conditionId = await create(buildCondition({ patientId: patient.id, encounterId, summary: analysisResult.summary }, now));
        const observationId = await create(buildTriageObservation(analysisResult, patient.id, now, encounterId));
        console.log(`[FHIR] 已存檔 Encounter/${encounterId}、Condition/${conditionId}、Observation/${observationId}`);
        return { encounterId, conditionId, observationId };
    } catch (error) {
        if (error.response) {
            // 伺服器有回應，但狀態碼不在 2xx 範圍內；FHIR 的錯誤細節在 OperationOutcome 裡
            console.error('[FHIR] 上傳失敗 - 狀態碼 (Status):', error.response.status);
            for (const i of summarizeOutcome(error.response.data)) console.error(`  [${i.severity}] ${i.location} ${i.message}`);
            if ([400, 412, 422].includes(error.response.status)) console.error('  提示：Patient 要先在同一台 FHIR Server 建好（① 建立資料），Encounter／Observation 才引用得到。');
        } else {
            console.error('[FHIR] 上傳失敗:', error.message); // 沒回應（斷線、逾時）或回應內容不對
        }
        return null;
    }
}

module.exports = { saveTriage };
