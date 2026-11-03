// tools/export-examples.js
// 用後端實際送出的組法（services/twcoreResources.js）產生範例 JSON，放到 tools/examples/，
// 再用 validate.sh / validate.bat 交給 HL7 官方 validator_cli 對 TW Core IG 驗證（C 聯測模擬第 22 頁）。
// 執行：在 1_Project 底下 node tools/export-examples.js
const fs = require('fs');
const path = require('path');
const tw = require('../AI-Patient-Triage-System/services/twcoreResources');

const out = path.join(__dirname, 'examples');
fs.mkdirSync(out, { recursive: true });

// 虛構資料；身分證字號 A123456789 是 TW Core IG 官方範例用的號碼
const AT = new Date('2026-10-31T13:00:00+08:00');
const examples = {
    'Organization-example': { id: 'org-ai-triage-example', ...tw.buildOrganization({ orgCode: '0131060029', phone: '02-1234-5678' }) },
    'Practitioner-example': { id: 'pra-ai-triage-example', ...tw.buildPractitioner({ name: '王醫師', licenseNumber: '醫字第000999號', idCardNumber: 'D123456789', gender: 'male' }) },
    'PractitionerRole-example': { id: 'prarole-ai-triage-example', ...tw.buildPractitionerRole({ practitionerId: 'pra-ai-triage-example', organizationId: 'org-ai-triage-example' }) },
    'Patient-example': tw.buildPatient({ id: 'patient-tw-example', name: '陳小明', idCardNumber: 'A123456789', gender: 'male', birthDate: '1995-05-20', managingOrganizationId: 'org-ai-triage-example', practitionerId: 'pra-ai-triage-example' }),
    'Encounter-example': { id: 'enc-ai-triage-example', ...tw.buildEncounter({ patientId: 'patient-tw-example', practitionerId: 'pra-ai-triage-example', organizationId: 'org-ai-triage-example' }, AT) },
    'Condition-example': { id: 'con-ai-triage-example', ...tw.buildCondition({ patientId: 'patient-tw-example', encounterId: 'enc-ai-triage-example', summary: '病人主訴胸痛及呼吸困難' }, AT) },
    'Task-example': { id: 'task-ai-triage-example', ...tw.buildTask({ patientId: 'patient-tw-example', observationId: 'obs-ai-triage-example', practitionerId: 'pra-ai-triage-example', reason: '病人主訴胸痛及呼吸困難' }, AT) },
    'Appointment-example': { id: 'appt-ai-triage-example', ...tw.buildAppointment({ patientId: 'patient-tw-example', observationId: 'obs-ai-triage-example', practitionerId: 'pra-ai-triage-example', reason: '活動時呼吸急促' }, AT) },
    'Observation-triage-example': {
        id: 'obs-ai-triage-example',
        ...tw.buildTriageObservation({
            emotion: '焦慮', urgency_score: 9, symptoms: ['胸痛', '呼吸困難'],
            needs_human_intervention: true, summary: '病人主訴胸痛及呼吸困難，建議立即就醫評估。'
        }, 'patient-tw-example', AT, 'enc-ai-triage-example')
    }
};

for (const [name, resource] of Object.entries(examples)) {
    // id 放在 resourceType 後面，方便閱讀
    const { resourceType, id, ...rest } = resource;
    fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify({ resourceType, id, ...rest }, null, 2) + '\n');
    console.log('寫出', path.join('tools', 'examples', `${name}.json`));
}
fs.copyFileSync(path.join(__dirname, '..', 'AI-Patient-Triage-System', 'fhir', 'CodeSystem-ai-triage.json'), path.join(out, 'CodeSystem-ai-triage.json'));
console.log('寫出', path.join('tools', 'examples', 'CodeSystem-ai-triage.json'));

// 聯測匯入：FHIRfox Simplified JSON 範例（Level 1–3，12 筆）轉成的 Bundle，跟上傳前驗證的是同一份
const { convert } = require('../AI-Patient-Triage-System/services/fhirfoxConverter');
const { bundle, issues } = convert(require('../AI-Patient-Triage-System/fhir/fhirfox-sample.json'));
if (issues.some(i => i.severity === 'error')) throw new Error('範例轉換有錯：' + JSON.stringify(issues));
fs.writeFileSync(path.join(out, 'Bundle-fhirfox-import-example.json'), JSON.stringify(bundle, null, 2) + '\n');
console.log('寫出', path.join('tools', 'examples', 'Bundle-fhirfox-import-example.json'));
