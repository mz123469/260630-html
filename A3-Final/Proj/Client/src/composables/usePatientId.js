// src/composables/usePatientId.js
// 三個頁面共用、記在這台瀏覽器 localStorage 的狀態：目前病人、機構、登入的醫師、使用模式。
// 空字串代表「還沒有」，畫面會引導使用者先去建立或登入。被改壞的值一律當作沒有。
import { ref, watch } from 'vue';

function stored(key, valid) {
  let v = '';
  try { v = localStorage.getItem(key) || ''; } catch { /* 無痕視窗可能擋 localStorage */ }
  const x = ref(valid(v) ? v : '');
  watch(x, (n) => {
    try { localStorage.setItem(key, (n || '').trim()); } catch { /* 存不進去就只留在記憶體 */ }
  });
  return x;
}
const isId = (v) => /^[A-Za-z0-9\-.]{1,64}$/.test(v) && v !== 'null' && v !== 'undefined';
const isName = (v) => v.length > 0 && v.length <= 100 && !/[<>]/.test(v);

// 放在模組最外層：整個 app 各只有一個 ref
const patientId = stored('triage-patient-id', isId);
const orgId = stored('triage-org-id', isId);
const practitionerId = stored('triage-practitioner-id', isId);
const practitionerName = stored('triage-practitioner-name', isName);
// 使用模式：general＝一般使用（病人端／醫師端／醫師查看），connectathon＝聯測順序（①②③）
const mode = stored('triage-mode', (v) => ['general', 'connectathon'].includes(v));
if (!mode.value) mode.value = 'general';

export const usePatientId = () => patientId;
export const useOrgId = () => orgId;
export const usePractitioner = () => ({ id: practitionerId, name: practitionerName });
export const useMode = () => mode;
