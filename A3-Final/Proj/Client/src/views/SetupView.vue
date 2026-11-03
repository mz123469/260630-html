<script setup>
// ① 建立資料：照 C 聯測模擬第 21 頁的順序，一個按鈕依序建立
//    0. CodeSystem → 1. Organization → 2. Practitioner → 3. PractitionerRole（醫師在這家機構的職務）→ 4. Patient
// 資源怎麼組、送出前檢查什麼，在後端 services/twcoreResources.js 與 routes/twcore.js。
import { reactive, ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { call } from '../api';
import { usePatientId, useOrgId } from '../composables/usePatientId';

const router = useRouter();
const patientId = usePatientId();
const orgId = useOrgId();

const form = reactive({
  orgCode: '',
  praName: '', licenseNumber: '',
  patName: '', idCardNumber: '', gender: '', birthDate: '', patId: ''
});

// 醫事機構只能從官方清單選（Organization-hosp-twcore 的規定），清單由後端提供
const orgCodes = ref([]);
onMounted(async () => {
  const r = await call('get', '/api/twcore/organization-codes');
  if (Array.isArray(r)) orgCodes.value = r;
});

// 一鍵填入虛構資料。身分證和證書字號每次隨機產生：測試伺服器是大家共用的，
// 用固定號碼會撞到別人建的資料（機構代碼只能用官方清單，撞到是正常的，會請你確認是否更新）
const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
function fillExample() {
  Object.assign(form, {
    orgCode: '0131060029',
    praName: '王醫師', licenseNumber: `醫字第0${digits(5)}號`,
    patName: '陳小明', idCardNumber: `${'ABCDEFGHJKLMNPQRSTUVXYWZIO'[Math.floor(Math.random() * 26)]}${1 + Math.floor(Math.random() * 2)}${digits(8)}`,
    gender: 'male', birthDate: '1995-05-20',
    patId: `patient-tw-${Date.now().toString(36)}`
  });
}

const STEPS = [
  { key: 'codesystem', label: 'AI 分流代碼表（CodeSystem）' },
  { key: 'organization', label: '醫療機構（Organization）' },
  { key: 'practitioner', label: '醫事人員（Practitioner）' },
  { key: 'practitioner-role', label: '醫師職務（PractitionerRole）' },
  { key: 'patient', label: '病人（Patient）' }
];
const results = reactive({});
const running = ref(false);

const body = {
  organization: () => ({ orgCode: form.orgCode }),
  practitioner: () => ({ name: form.praName, licenseNumber: form.licenseNumber }),
  'practitioner-role': () => ({ practitionerId: results.practitioner?.id, organizationId: results.organization?.id }),
  patient: () => ({
    id: form.patId, name: form.patName, idCardNumber: form.idCardNumber, gender: form.gender, birthDate: form.birthDate,
    managingOrganizationId: results.organization?.id, practitionerId: results.practitioner?.id
  })
};
const send = (key, update) => key === 'codesystem'
  ? call('put', '/api/twcore/codesystem')
  : call('post', `/api/twcore/${key}`, { ...body[key](), ...(update ? { update: true } : {}) });

// 錯誤位置（FHIRPath）對到畫面上的欄位，讓那一格變紅
const FIELD = {
  'Organization.identifier[0].value': 'orgCode',
  'Practitioner.name[0].text': 'praName', 'Practitioner.identifier[0].value': 'license',
  'Patient.id': 'patId', 'Patient.name[0].text': 'patName', 'Patient.identifier[0].value': 'idCard',
  'Patient.gender': 'gender', 'Patient.birthDate': 'birth'
};
const invalid = computed(() => new Set(STEPS.flatMap(s => (results[s.key]?.issues || [])
  .filter(i => i.severity === 'error' || i.severity === 'fatal').map(i => FIELD[i.location]))));
const SEVERITY = { fatal: '錯誤', error: '錯誤', warning: '警告', information: '資訊' };

// 手機上結果欄在表單下面：有結果就捲過去
const showResults = () => nextTick(() => document.querySelector('.side')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));

// 從第 start 步開始依序送出，前一步失敗就停（後面的資源會引用前面的 id）
async function runFrom(start, updateKey) {
  running.value = true;
  for (const s of STEPS.slice(start)) {
    results[s.key] = { pending: true };
    results[s.key] = await send(s.key, s.key === updateKey);
    if (!results[s.key].success) break;
  }
  if (results.patient?.success) {
    patientId.value = results.patient.id;
    orgId.value = results.organization.id;
    lastCreated = JSON.stringify(form);
  }
  running.value = false;
  showResults();
}

let lastCreated = ''; // 上次成功建立時的表單內容
async function createAll() {
  // 表單沒改又按一次（手抖、以為沒反應）：不重複送出（使用者測試 U09）
  if (JSON.stringify(form) === lastCreated) return;
  STEPS.forEach(s => { results[s.key] = null; });
  // 先一次檢查三種資源、列出全部錯誤；都沒問題才送出
  running.value = true;
  const keys = ['organization', 'practitioner', 'patient'];
  const checks = await Promise.all(keys.map(k => call('post', `/api/twcore/${k}?check=1`, body[k]())));
  running.value = false;
  if (checks.some(r => !r.success)) {
    keys.forEach((k, i) => { results[k] = checks[i]; });
    return showResults();
  }
  await runFrom(0);
}

// 已經有同一筆：使用者確認要更新才更新，從這一步接著做完；不更新就維持錯誤
const confirmUpdate = (key) => runFrom(STEPS.findIndex(s => s.key === key), key);
function cancelUpdate(key) {
  results[key] = { ...results[key], exists: false, error: '沒有更新。這筆資料已經存在，要建立新的請改填不同的資料。' };
}

// 已經有病人（例如 FHIRfox 情境或聯測夥伴建好的）：輸入 ID，讀得到就直接用
const existingId = ref('');
const existingMsg = ref('');
async function useExisting() {
  existingMsg.value = '';
  if (!existingId.value) { existingMsg.value = '請輸入 Patient ID'; return; }
  const r = await call('get', `/api/twcore/patient/${encodeURIComponent(existingId.value)}`);
  if (r.resourceType !== 'Patient') { existingMsg.value = r.error; return; }
  patientId.value = r.id;
  orgId.value = r.managingOrganization?.reference?.split('/')[1] || '';
  router.push('/');
}
</script>

<template>
  <div class="page split">
    <div class="panel">
      <h1>① 建立資料</h1>
      <p class="lead">先建立醫療機構、醫師和病人，才能做病人回報。第一次用，按「填入範例」再按「建立」就好。請只用虛構資料。</p>

      <h3>醫療機構</h3>
      <div class="field" :class="{ invalid: invalid.has('orgCode') }">
        <label for="orgCode">機構</label>
        <select id="orgCode" v-model="form.orgCode">
          <option value="" disabled>請選擇</option>
          <option v-for="c in orgCodes" :key="c.code" :value="c.code">{{ c.display }}（{{ c.code }}）</option>
        </select>
        <small>TW Core 規定只能選官方清單裡的醫事機構</small>
      </div>

      <h3>醫師</h3>
      <div class="grid">
        <div class="field" :class="{ invalid: invalid.has('praName') }"><label for="praName">姓名</label><input id="praName" v-model.trim="form.praName" /></div>
        <div class="field" :class="{ invalid: invalid.has('license') }"><label for="license">證書字號</label><input id="license" v-model.trim="form.licenseNumber" /><small>例：醫字第012345號</small></div>
      </div>

      <h3>病人</h3>
      <div class="grid">
        <div class="field" :class="{ invalid: invalid.has('patName') }"><label for="patName">姓名</label><input id="patName" v-model.trim="form.patName" /></div>
        <div class="field" :class="{ invalid: invalid.has('idCard') }"><label for="idCard">身分證字號</label><input id="idCard" v-model.trim="form.idCardNumber" /><small>1 個英文字母加 9 個數字</small></div>
        <div class="field" :class="{ invalid: invalid.has('gender') }">
          <label for="gender">性別</label>
          <select id="gender" v-model="form.gender">
            <option value="" disabled>請選擇</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
            <option value="unknown">不詳</option>
          </select>
        </div>
        <div class="field" :class="{ invalid: invalid.has('birth') }"><label for="birth">生日</label><input id="birth" v-model.trim="form.birthDate" type="date" /></div>
        <div class="field" :class="{ invalid: invalid.has('patId') }"><label for="patId">病人代號（選填）</label><input id="patId" v-model.trim="form.patId" /><small>英數與連字號；空白則由伺服器編號</small></div>
      </div>

      <div class="actions">
        <button class="btn ghost" @click="fillExample" :disabled="running">填入範例</button>
        <button class="btn" @click="createAll" :disabled="running">{{ running ? '建立中…' : '建立' }}</button>
      </div>
    </div>

    <!-- 右欄：一開始就列出會建立哪些東西，按下建立後逐項變成 ✓ / ✗ -->
    <div class="panel side">
      <h3>建立結果</h3>
      <template v-for="s in STEPS" :key="s.key">
        <div v-if="results[s.key]" class="alert" :class="results[s.key].pending ? 'info' : results[s.key].success ? 'ok' : results[s.key].exists ? 'warning' : 'error'">
          <strong>{{ results[s.key].pending ? '…' : results[s.key].success ? '✓' : '✗' }} {{ s.label }}</strong>
          <span v-if="results[s.key].checked">：檢查通過</span>
          <span v-else-if="results[s.key].success">：{{ results[s.key].reused ? '已存在，沿用' : results[s.key].updated ? '已更新' : '已建立' }}（HTTP {{ results[s.key].status }}，ID {{ results[s.key].id }}）</span>
          <span v-else-if="!results[s.key].pending">：{{ results[s.key].status ? `HTTP ${results[s.key].status}，` : '' }}{{ results[s.key].error }}</span>
          <!-- 本機檢查與伺服器 OperationOutcome 都列出來：位置＋內容。錯誤一定要修、警告看狀況、資訊可先放著 -->
          <ul v-if="results[s.key].issues?.length">
            <li v-for="(i, n) in results[s.key].issues" :key="n">
              【{{ SEVERITY[i.severity] || i.severity }}】<code v-if="i.location">{{ i.location }}</code> {{ i.message }}
            </li>
          </ul>
          <div v-if="results[s.key].exists" class="actions">
            <button class="btn" @click="confirmUpdate(s.key)" :disabled="running">更新這筆</button>
            <button class="btn ghost" @click="cancelUpdate(s.key)" :disabled="running">不要更新</button>
          </div>
        </div>
        <p v-else class="muted">○ {{ s.label }}</p>
      </template>
      <div v-if="results.patient?.success && !results.patient.checked" class="actions">
        <button class="btn" @click="router.push('/')">下一步：② 病人回報 →</button>
      </div>

      <details class="existing">
        <summary>已經有病人了？直接使用</summary>
        <div class="field">
          <label for="existingId">Patient ID</label>
          <input id="existingId" v-model.trim="existingId" @keyup.enter="useExisting" />
          <small>FHIR Server 上已存在的病人，例如聯測情境的病人</small>
        </div>
        <button class="btn ghost" @click="useExisting">使用這位病人</button>
        <div v-if="existingMsg" class="alert error">{{ existingMsg }}</div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.existing { margin-top: 1.2rem; border-top: 1px solid var(--line); padding-top: .8rem; }
.existing summary { cursor: pointer; color: var(--muted); margin-bottom: .6rem; }
.field.invalid input, .field.invalid select { border-color: var(--bad); box-shadow: 0 0 0 4px rgba(255,59,48,.14); }
</style>
