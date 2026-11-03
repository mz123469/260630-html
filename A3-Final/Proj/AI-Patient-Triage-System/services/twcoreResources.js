// services/twcoreResources.js
// 依「臺灣核心實作指引 TW Core IG 1.0.0」（tw.gov.mohw.twcore#1.0.0）組出 FHIR R4 資源。
// 欄位寫法照 IG 官方範例：Organization-org-example、Practitioner-pra-dr-example、Patient-pat-example、
// Observation-obs-screening-assessment-example。
// 建立順序照 C 聯測模擬第 21 頁：Organization → Practitioner → Patient，最後才是 AI 分流 Observation。

const TWCORE = 'https://twcore.mohw.gov.tw/ig/twcore';
const PROFILE = {
    // 醫事機構用 hosp 版：identifier.value 只能是官方清單裡的機構代碼（fhir/organization-codes.json），type 固定 prov
    organization: `${TWCORE}/StructureDefinition/Organization-hosp-twcore`,
    practitioner: `${TWCORE}/StructureDefinition/Practitioner-twcore`,
    patient: `${TWCORE}/StructureDefinition/Patient-twcore`,
    // AI 分流是「病人自述 → 評估分數」，對應 TW Core 的「健康狀態篩檢與評估」Profile（category 必須有 survey）
    observation: `${TWCORE}/StructureDefinition/Observation-screening-assessment-twcore`,
    // 聯測松 Track 1 Level 1「基本就醫紀錄」還要這三種：醫師職務、就醫、問題
    practitionerRole: `${TWCORE}/StructureDefinition/PractitionerRole-twcore`,
    encounter: `${TWCORE}/StructureDefinition/Encounter-twcore`,
    condition: `${TWCORE}/StructureDefinition/Condition-twcore`
};
// 科別：本系統沒有門診科別，用健保科別代碼「00 不分科」（Encounter.serviceType 的 slice 綁定這個 CodeSystem）
const DEPT = { system: `${TWCORE}/CodeSystem/medical-consultation-department-nhi-tw`, code: '00', display: '不分科' };
const ref = (type, id) => ({ reference: `${type}/${id}` });

const V2_0203 = 'http://terminology.hl7.org/CodeSystem/v2-0203';
const SYSTEM = {
    orgIdentifier: `${TWCORE}/CodeSystem/organization-identifier-tw`, // 醫事機構代碼（IG 範例同一個 system）
    idCard: 'http://www.moi.gov.tw',                                  // Profile 規定的身分證字號 system（http，不是 https）
    // 醫事人員證書字號：IG 沒有指定 system，範例是用機構網址。這裡用衛福部醫事管理系統；Track 若另有規定就改這一行
    medicalLicense: process.env.MEDICAL_LICENSE_SYSTEM || 'https://ma.mohw.gov.tw',
    medicalRecord: process.env.MEDICAL_RECORD_SYSTEM || 'https://www.tph.mohw.gov.tw',
    // 轉介單／回診的識別碼 system：值＝對應的 Observation id，同一筆評估只建一次。validator 不准 identifier.system 用 example.org，先掛在病歷號的網域下，正式上線改成自己機構的
    followUp: process.env.FOLLOW_UP_ID_SYSTEM || 'https://www.tph.mohw.gov.tw/ai-triage/follow-up'
};

// 本專案自訂的 CodeSystem（定義檔在 fhir/CodeSystem-ai-triage.json）。
// 原本沿用的 LOINC 80615-8 官方語意是「Recommended follow-up [Identifier] Narrative」，跟急迫性分數不符，
// 聯測時對方會照 LOINC 語意解讀（C 聯測模擬第 2 頁：有標準 ≠ 能互通），所以改用自訂代碼並在 CodeSystem 裡說清楚。
const TRIAGE_CS = process.env.TRIAGE_CODESYSTEM_URL || 'http://example.org/fhir/ai-triage/CodeSystem/ai-triage';
const TRIAGE_CODE = {
    urgency: { system: TRIAGE_CS, code: 'urgency-score', display: 'AI 分流急迫性分數' },
    emotion: { system: TRIAGE_CS, code: 'emotion', display: '核心情緒' },
    needsHuman: { system: TRIAGE_CS, code: 'needs-human-intervention', display: '需人工介入' }
};

const GENDERS = ['male', 'female', 'other', 'unknown'];
const FHIR_ID = /^[A-Za-z0-9\-.]{1,64}$/;      // FHIR R4 id 規則
const ID_CARD = /^[A-Za-z][0-9]{9}$/;          // TW Core Profile 的 id-card-number 規則
const ORG_CODES = require('../fhir/organization-codes.json').codes;
const MAX_TEXT = 100;                          // 姓名、字號這類欄位的長度上限（白帽測試 A8：原本 100KB 也收）

// FHIR string 不能含控制字元（只准 tab、換行），ESC 之類的會讓驗證器報錯、也能在終端機偽造紀錄（白帽測試 G1、H1）
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const clean = (v) => String(v ?? '').replace(CONTROL, '');
// 不是字串就當成空字串，避免物件、陣列混進資源（白帽測試 A4、A5）
function str(v) { return typeof v === 'string' ? clean(v).trim() : ''; }

// YYYY-MM-DD，而且是真的存在、不在未來的日期（白帽測試 A6、A7：2 月 31 日、2999 年原本都收）
function isPastDate(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    const d = new Date(`${v}T00:00:00Z`);
    return !isNaN(d) && d.toISOString().slice(0, 10) === v && d <= new Date() && v >= '1900-01-01';
}

// 送出前先自己檢查：C 聯測模擬第 23 頁的常見錯誤在這裡就擋掉。
// 每條規則：[錯了嗎, 錯在資源的哪個欄位, 錯誤訊息]；位置用 FHIRPath，跟伺服器 OperationOutcome 的寫法一樣
function collect(rules) { return rules.filter(([bad]) => bad).map(([, location, message]) => ({ location, message })); }
const tooLong = (...vals) => vals.some(v => str(v).length > MAX_TEXT);

function checkOrganization(i) {
    return collect([
        [!ORG_CODES.some(c => c.code === str(i.orgCode)), 'Organization.identifier[0].value', '醫事機構要從清單選（TW Core 規定只能用官方機構代碼）'],
        [tooLong(i.name, i.phone, i.address), 'Organization.name', `每個欄位最多 ${MAX_TEXT} 字`]
    ]);
}

function checkPractitioner(i) {
    return collect([
        [!str(i.name), 'Practitioner.name[0].text', '醫事人員姓名必填'],
        [!str(i.licenseNumber), 'Practitioner.identifier[0].value', '證書字號必填'],
        [str(i.idCardNumber) && !ID_CARD.test(str(i.idCardNumber)), 'Practitioner.identifier', '身分證字號是 1 個英文字母加 9 個數字'],
        [i.gender && !GENDERS.includes(i.gender), 'Practitioner.gender', '性別只能選 male / female / other / unknown'],
        [tooLong(i.name, i.licenseNumber), 'Practitioner.name[0].text', `每個欄位最多 ${MAX_TEXT} 字`]
    ]);
}

function checkPatient(i) {
    return collect([
        [str(i.id) && !FHIR_ID.test(str(i.id)), 'Patient.id', '自訂 ID 只能用英數、連字號、句點，1 到 64 字'],
        [!str(i.name), 'Patient.name[0].text', '病人姓名必填'],
        [!ID_CARD.test(str(i.idCardNumber)), 'Patient.identifier[0].value', '身分證字號是 1 個英文字母加 9 個數字'],
        [!GENDERS.includes(i.gender), 'Patient.gender', '性別必填，只能選 male / female / other / unknown（不能填 M / F）'],
        [!isPastDate(str(i.birthDate)), 'Patient.birthDate', '生日必填，要是存在的日期而且不能在未來'],
        [str(i.managingOrganizationId) && !FHIR_ID.test(str(i.managingOrganizationId)), 'Patient.managingOrganization', '所屬機構 ID 格式不對'],
        [str(i.practitionerId) && !FHIR_ID.test(str(i.practitionerId)), 'Patient.generalPractitioner', '主治醫師 ID 格式不對'],
        [tooLong(i.name, i.phone, i.medicalRecordNumber), 'Patient.name[0].text', `每個欄位最多 ${MAX_TEXT} 字`]
    ]);
}

function checkPractitionerRole(i) {
    return collect([
        [!FHIR_ID.test(str(i.practitionerId)), 'PractitionerRole.practitioner', '要先建立醫事人員'],
        [!FHIR_ID.test(str(i.organizationId)), 'PractitionerRole.organization', '要先建立醫療機構']
    ]);
}

// 人看得懂的摘要（Resource.text）。少了它驗證器會給 dom-6 警告；內容一律跳脫，避免把 HTML 塞進資源
const esc = (v) => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function narrative(...lines) {
    return { status: 'generated', div: `<div xmlns="http://www.w3.org/1999/xhtml">${lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>` };
}

// ---- 組資源 ----
function buildOrganization(input) {
    const org = {
        resourceType: 'Organization',
        meta: { profile: [PROFILE.organization] },
        identifier: [{
            use: 'official',
            type: { coding: [{ system: V2_0203, code: 'PRN', display: 'Provider number' }] }, // 第 23 頁：缺 identifier.type 會報錯
            system: SYSTEM.orgIdentifier,
            value: str(input.orgCode)
        }],
        active: true,
        // type 是 Must Support（example binding）：用 FHIR 內建的 prov（醫療服務提供者）
        type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/organization-type', code: 'prov', display: 'Healthcare Provider' }] }],
        name: str(input.name) || ORG_CODES.find(c => c.code === str(input.orgCode))?.display || ''
    };
    org.text = narrative(`醫事機構：${org.name}（${str(input.orgCode)}）`);
    if (str(input.phone)) org.telecom = [{ system: 'phone', value: str(input.phone), use: 'work' }];
    if (str(input.address)) org.address = [{ use: 'work', text: str(input.address), country: 'TW' }];
    return org;
}

function buildPractitioner(input) {
    const identifier = [];
    if (str(input.idCardNumber)) {
        identifier.push({
            use: 'official',
            type: { coding: [{ system: V2_0203, code: 'NNxxx' }] },
            system: SYSTEM.idCard,
            value: str(input.idCardNumber).toUpperCase()
        });
    }
    identifier.push({
        use: 'official',
        type: { coding: [{ system: V2_0203, code: 'MD', display: 'Medical License number' }] },
        system: SYSTEM.medicalLicense,
        value: str(input.licenseNumber)
    });
    const pra = {
        resourceType: 'Practitioner',
        meta: { profile: [PROFILE.practitioner] },
        identifier,
        active: true,
        name: [{ use: 'official', text: str(input.name) }]
    };
    if (input.gender) pra.gender = input.gender;
    pra.text = narrative(`醫事人員：${str(input.name)}`, `證書字號：${str(input.licenseNumber)}`);
    return pra;
}

function buildPatient(input) {
    const identifier = [{
        use: 'official',
        type: { coding: [{ system: V2_0203, code: 'NNxxx' }] },
        system: SYSTEM.idCard,
        value: str(input.idCardNumber).toUpperCase()
    }];
    if (str(input.medicalRecordNumber)) {
        identifier.push({
            use: 'official',
            type: { coding: [{ system: V2_0203, code: 'MR' }] },
            system: SYSTEM.medicalRecord,
            value: str(input.medicalRecordNumber)
        });
    }
    const pat = {
        resourceType: 'Patient',
        ...(str(input.id) ? { id: str(input.id) } : {}),
        meta: { profile: [PROFILE.patient] },
        identifier,
        active: true,
        name: [{ use: 'official', text: str(input.name) }],
        gender: input.gender,
        birthDate: str(input.birthDate)
    };
    pat.text = narrative(`病人：${str(input.name)}`, `性別：${input.gender}，生日：${str(input.birthDate)}`); // 身分證不放進摘要
    if (str(input.phone)) pat.telecom = [{ system: 'phone', value: str(input.phone), use: 'mobile' }];
    if (str(input.managingOrganizationId)) pat.managingOrganization = { reference: `Organization/${str(input.managingOrganizationId)}` };
    // 主治醫師：Profile 允許指向 Practitioner-twcore；建了醫師就掛上來，資源之間才有關聯
    if (str(input.practitionerId)) pat.generalPractitioner = [{ reference: `Practitioner/${str(input.practitionerId)}` }];
    return pat;
}

// 醫師在某機構的職務：code 用 SNOMED 309343006 Physician（ValueSet health-professional-sct-tw 收 223366009 的子代）
function buildPractitionerRole(input) {
    const role = {
        resourceType: 'PractitionerRole',
        meta: { profile: [PROFILE.practitionerRole] },
        active: true,
        practitioner: ref('Practitioner', str(input.practitionerId)),
        organization: ref('Organization', str(input.organizationId)),
        code: [{ coding: [{ system: 'http://snomed.info/sct', code: '309343006', display: 'Medical doctor' }], text: '醫師' }], // display 要跟 SNOMED 的一致，twcore 伺服器會核對
        specialty: [{ coding: [DEPT], text: DEPT.display }]
    };
    role.text = narrative(`職務：醫師（${role.practitioner.reference}，${role.organization.reference}）`);
    return role;
}

// 一次病人回報＝一次遠距就醫（class VR＝virtual）：把病人、主治醫師、機構串在同一個 Encounter
function buildEncounter({ patientId, practitionerId, organizationId }, now = new Date()) {
    const enc = {
        resourceType: 'Encounter',
        meta: { profile: [PROFILE.encounter] },
        status: 'finished',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'VR', display: 'virtual' },
        serviceType: { coding: [DEPT], text: DEPT.display },
        subject: ref('Patient', patientId),
        period: { start: now.toISOString(), end: now.toISOString() },
        reasonCode: [{ text: '病人自述回報（AI 分流）' }]
    };
    if (practitionerId) enc.participant = [{ type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND', display: 'attender' }] }], individual: ref('Practitioner', practitionerId) }];
    if (organizationId) enc.serviceProvider = ref('Organization', organizationId);
    enc.text = narrative(`遠距回報：${now.toISOString()}`);
    return enc;
}

// 這次回報的問題：沒有 ICD 編碼，code.text 放 AI 摘要；verificationStatus=unconfirmed（AI 判讀，醫師還沒確認）
function buildCondition({ patientId, encounterId, summary }, now = new Date()) {
    const con = {
        resourceType: 'Condition',
        meta: { profile: [PROFILE.condition] },
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }] },
        verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'unconfirmed', display: 'Unconfirmed' }] },
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis', display: 'Encounter Diagnosis' }] }],
        code: { text: summary },
        subject: ref('Patient', patientId),
        encounter: ref('Encounter', encounterId),
        onsetDateTime: now.toISOString(),
        recordedDate: now.toISOString(),
        asserter: ref('Patient', patientId)
    };
    con.text = narrative(`問題：${summary}`);
    return con;
}

// AI 結果 → TW Core 篩檢與評估 Observation（A3-6 的 mapping，改成符合 Profile 的寫法）
//   urgency_score            → valueQuantity（UCUM {score}，tw-core-5 規定 Quantity.system 只能是 UCUM）
//   emotion                  → component（不再塞進 code.text；code.text 要描述「量的是什麼」）
//   needs_human_intervention → component（valueBoolean），醫師端 CDS 會讀回來
//   summary / symptoms       → note
//   encounterId              → encounter（這筆評估屬於哪一次回報）
function buildTriageObservation(analysisResult, patientId, now = new Date(), encounterId) {
    return {
        resourceType: 'Observation',
        meta: { profile: [PROFILE.observation] },
        status: 'final',
        category: [{
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey', display: 'Survey' }]
        }],
        code: { coding: [TRIAGE_CODE.urgency], text: 'AI 分流急迫性評估（病人自述）' },
        subject: ref('Patient', patientId),
        ...(encounterId ? { encounter: ref('Encounter', encounterId) } : {}),
        performer: [{ reference: `Patient/${patientId}` }], // Must Support；內容是病人自述，Profile 允許 Patient-twcore
        effectiveDateTime: now.toISOString(),
        issued: now.toISOString(),
        valueQuantity: {
            value: analysisResult.urgency_score,
            unit: 'score',
            system: 'http://unitsofmeasure.org',
            code: '{score}'
        },
        component: [
            { code: { coding: [TRIAGE_CODE.emotion], text: '核心情緒' }, valueString: analysisResult.emotion || '未標示' },
            { code: { coding: [TRIAGE_CODE.needsHuman], text: '需人工介入' }, valueBoolean: Boolean(analysisResult.needs_human_intervention) }
        ],
        // 沒有症狀就不存空的 note（實測發現會留下一筆 "Symptoms: "）
        note: [
            { text: `AI Summary: ${analysisResult.summary}` },
            ...(analysisResult.symptoms?.length ? [{ text: `Symptoms: ${analysisResult.symptoms.join(', ')}` }] : [])
        ],
        text: narrative(`AI 分流急迫性分數：${analysisResult.urgency_score} / 10`, `摘要：${analysisResult.summary}`)
    };
}

// 醫師接受 CDS 卡片建議後建立的後續資源（11/03 講義第五階段加分項「CDS 建立 Task」）。
// TW Core 1.0.0 沒有 Task／Appointment 的 Profile（轉介另有 ServiceRequest-twcore，講義指定 Task），照 FHIR R4 基本定義組。
function checkFollowUp(type) {
    return (i) => collect([
        [!FHIR_ID.test(str(i.patientId)), `${type}.${type === 'Task' ? 'for' : 'participant'}`, '缺少病人'],
        [!FHIR_ID.test(str(i.observationId)), `${type}.${type === 'Task' ? 'focus' : 'reasonReference'}`, '缺少對應的 AI 評估紀錄'],
        [Boolean(str(i.practitionerId)) && !FHIR_ID.test(str(i.practitionerId)), `${type}.${type === 'Task' ? 'owner' : 'participant'}`, '醫師 id 格式不對'],
        [tooLong(i.reason), `${type}.description`, `原因請在 ${MAX_TEXT} 字以內`],
        [type === 'Appointment' && str(i.start) && !isFutureTime(str(i.start)), 'Appointment.start', '回診時間要是未來一年內的時間']
    ]);
}
// 醫師可以改回診時間：ISO 8601，必須在未來、一年以內（白帽第四輪：不收過去或 2999 年）
function isFutureTime(v) {
    const d = new Date(v);
    return !isNaN(d) && d > new Date() && d - new Date() <= 366 * 24 * 60 * 60 * 1000;
}
const followUpId = (prefix, i) => [{ system: SYSTEM.followUp, value: `${prefix}-${str(i.observationId)}` }];
const followUpWho = (i) => (str(i.practitionerId) ? ref('Practitioner', str(i.practitionerId)) : undefined);

// 轉介單：8 分以上的卡片 → Task（status requested、priority urgent），focus 指向那筆 AI 評估
function buildTask(input, now = new Date()) {
    const task = {
        resourceType: 'Task',
        identifier: followUpId('task', input),
        status: 'requested',
        intent: 'order',
        priority: 'urgent',
        code: { text: '轉介' },
        description: `AI 分流高風險：${str(input.reason) || '請盡快評估'}`,
        focus: ref('Observation', str(input.observationId)),
        for: ref('Patient', str(input.patientId)),
        authoredOn: now.toISOString(),
        lastModified: now.toISOString(),
        requester: followUpWho(input),
        owner: followUpWho(input)
    };
    task.text = narrative(`轉介單：${task.description}`, `病人 ${task.for.reference}，依據 ${task.focus.reference}`);
    return task;
}

// 回診：5–7 分的卡片 → Appointment（status proposed），預設三天後同一時間、30 分鐘，病人與醫師都待確認
function buildAppointment(input, now = new Date()) {
    // 預設三天後；醫師端可改。是不是未來一年內由 checkFollowUp 把關，這裡照送來的時間組，錯誤回應才看得到原值
    const given = new Date(str(input.start));
    const start = str(input.start) && !isNaN(given) ? given : new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const who = followUpWho(input);
    const appt = {
        resourceType: 'Appointment',
        identifier: followUpId('appointment', input),
        status: 'proposed',
        description: `回診追蹤：${str(input.reason) || 'AI 分流需留意'}`,
        start: start.toISOString(),
        end: end.toISOString(),
        minutesDuration: 30,
        created: now.toISOString(),
        reasonReference: [ref('Observation', str(input.observationId))],
        participant: [
            { actor: ref('Patient', str(input.patientId)), required: 'required', status: 'needs-action' },
            ...(who ? [{ actor: who, required: 'required', status: 'needs-action' }] : [])
        ]
    };
    appt.text = narrative(`回診：${appt.description}`, `時間 ${start.toISOString()}（30 分鐘），待病人與醫師確認`);
    return appt;
}

module.exports = {
    PROFILE, SYSTEM, TRIAGE_CS, TRIAGE_CODE, GENDERS, FHIR_ID, ORG_CODES, clean,
    checkOrganization, checkPractitioner, checkPatient, checkPractitionerRole, checkTask: checkFollowUp('Task'), checkAppointment: checkFollowUp('Appointment'),
    buildOrganization, buildPractitioner, buildPatient, buildPractitionerRole, buildEncounter, buildCondition, buildTriageObservation, buildTask, buildAppointment
};
