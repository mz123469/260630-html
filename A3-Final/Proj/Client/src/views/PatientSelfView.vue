<script setup>
// 病人端（一般使用）：病人自己填基本資料和現在的感覺，按一次「送出」。
// 後端 POST /api/triage/report：確認機構 → 找或建病人（同身分證就沿用，不覆蓋）→ AI 評估 → 存 FHIR。
import { reactive, ref, computed, onMounted, nextTick } from 'vue';
import { call } from '../api';
import { usePatientId, useOrgId } from '../composables/usePatientId';

const patientId = usePatientId();
const orgId = useOrgId();
const form = reactive({ name: '', idCardNumber: '', gender: '', birthDate: '', orgCode: '', patientText: '' });
const orgCodes = ref([]);
onMounted(async () => {
  const r = await call('get', '/api/twcore/organization-codes');
  if (Array.isArray(r)) orgCodes.value = r;
});

const EXAMPLES = [
  '我吃了新開的血壓藥之後頭很暈，剛剛差點在浴室跌倒，我很害怕。',
  '傷口復原得不錯，已經不痛了，想問下禮拜可以開始運動嗎？',
  '沒事啦，就是這幾天爬樓梯常常喘不過氣，大概是天氣太熱。'
];
// 一鍵填入虛構資料；身分證隨機，測試伺服器是共用的，固定號碼會撞到別人
const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
function fillExample() {
  Object.assign(form, {
    name: '陳小明', idCardNumber: `${'ABCDEFGHJKLMNPQRSTUVXYWZIO'[Math.floor(Math.random() * 26)]}${1 + Math.floor(Math.random() * 2)}${digits(8)}`,
    gender: 'male', birthDate: '1995-05-20', orgCode: '0131060029', patientText: form.patientText || EXAMPLES[0]
  });
}

const result = ref(null);
const errorMsg = ref('');
const issues = ref([]);
const loading = ref(false);
// 後端回的錯誤位置（FHIRPath）對到欄位，讓那一格變紅
const FIELD = { 'Organization.identifier[0].value': 'orgCode', 'Patient.name[0].text': 'name', 'Patient.identifier[0].value': 'idCardNumber', 'Patient.gender': 'gender', 'Patient.birthDate': 'birthDate', 'patientText': 'patientText' };
const invalid = computed(() => new Set(issues.value.map(i => FIELD[i.location]).filter(Boolean)));

// 跟醫師端卡片同一套門檻：>= 8 紅、>= 5 或需人工介入 橘、其他綠
function level(d) {
  if (d.urgency_score >= 8) return { cls: 'critical', text: '請盡快就醫或撥打 119' };
  if (d.urgency_score >= 5 || d.needs_human_intervention) return { cls: 'warning', text: '醫護人員會主動與您聯繫' };
  return { cls: 'ok', text: '已記錄，醫護人員會在回診時查看' };
}

let lastSent = '';
async function submit() {
  errorMsg.value = ''; issues.value = []; result.value = null;
  // 本機先擋最常見的漏填，不用等伺服器
  const missing = [['name', '姓名'], ['idCardNumber', '身分證字號'], ['gender', '性別'], ['birthDate', '生日'], ['orgCode', '就醫的醫療機構']].filter(([k]) => !form[k]).map(([, l]) => l);
  if (!form.patientText.trim()) missing.push('現在的感覺');
  if (missing.length) { errorMsg.value = `還沒填：${missing.join('、')}`; issues.value = missing.map(() => ({})); return; }
  if (JSON.stringify(form) === lastSent) return; // 內容沒改又按一次：不重複送
  loading.value = true;
  const r = await call('post', '/api/triage/report', { ...form });
  loading.value = false;
  if (r.success) {
    result.value = r; lastSent = JSON.stringify(form);
    patientId.value = r.patient_id; // 讓「醫師查看」直接看得到這位病人
  } else { errorMsg.value = r.error; issues.value = r.issues || []; } // 失敗就說失敗，絕不顯示成低風險
  await nextTick();
  document.querySelector('.side')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
</script>

<template>
  <div class="page split">
    <div class="panel">
      <h1>病人端</h1>
      <p class="lead">填好基本資料，再用平常說話的方式寫下現在的感覺，按「送出」就好。請只用虛構資料。</p>

      <h3>基本資料</h3>
      <div class="grid">
        <div class="field" :class="{ invalid: invalid.has('name') }"><label for="name">姓名</label><input id="name" v-model.trim="form.name" autocomplete="off" /></div>
        <div class="field" :class="{ invalid: invalid.has('idCardNumber') }"><label for="idCard">身分證字號</label><input id="idCard" v-model.trim="form.idCardNumber" autocomplete="off" /><small>1 個英文字母加 9 個數字</small></div>
        <div class="field" :class="{ invalid: invalid.has('gender') }">
          <label for="gender">性別</label>
          <select id="gender" v-model="form.gender">
            <option value="" disabled>請選擇</option>
            <option value="male">男</option><option value="female">女</option><option value="other">其他</option><option value="unknown">不詳</option>
          </select>
        </div>
        <div class="field" :class="{ invalid: invalid.has('birthDate') }"><label for="birth">生日</label><input id="birth" v-model.trim="form.birthDate" type="date" /></div>
      </div>
      <div class="field" :class="{ invalid: invalid.has('orgCode') }">
        <label for="orgCode">就醫的醫療機構</label>
        <select id="orgCode" v-model="form.orgCode">
          <option value="" disabled>請選擇</option>
          <option v-for="c in orgCodes" :key="c.code" :value="c.code">{{ c.display }}（{{ c.code }}）</option>
        </select>
      </div>

      <h3>現在的感覺</h3>
      <div class="field" :class="{ invalid: invalid.has('patientText') }">
        <label for="text">您現在覺得怎麼樣？</label>
        <textarea id="text" v-model="form.patientText" rows="5" maxlength="3000"></textarea>
        <small>不用再寫姓名、身分證或電話。不知道怎麼寫？點下面的例子：</small>
      </div>
      <div class="actions">
        <button v-for="e in EXAMPLES" :key="e" class="btn ghost example" @click="form.patientText = e">{{ e.slice(0, 14) }}…</button>
      </div>
      <div class="actions">
        <button class="btn ghost" @click="fillExample" :disabled="loading">填入範例</button>
        <button class="btn" @click="submit" :disabled="loading">{{ loading ? 'AI 分析中…' : '送出' }}</button>
      </div>
    </div>

    <div class="panel side">
      <h3>結果</h3>
      <div v-if="errorMsg" class="alert error">
        {{ errorMsg }}
        <ul v-if="issues.some(i => i.message)"><li v-for="(i, n) in issues.filter(i => i.message)" :key="n">{{ i.message }}</li></ul>
      </div>
      <div v-else-if="result" class="alert" :class="level(result.data).cls">
        <h3>{{ level(result.data).text }}</h3>
        <p>急迫程度 <strong>{{ result.data.urgency_score }}</strong> / 10　·　情緒：{{ result.data.emotion }}</p>
        <p>給醫師的摘要：{{ result.data.summary }}</p>
        <p v-if="result.alert_simulated"><small>（示範模式：通知只印在後端終端機，沒有真的送出 LINE）</small></p>
        <p><small>病人代號 {{ result.patient_id }}{{ result.patient_reused ? '（已有資料，沿用）' : '（新建立）' }}。已存檔：Encounter/{{ result.encounter_id }}、Condition/{{ result.condition_id }}、Observation/{{ result.fhir_reference }}。AI 判讀僅供參考，以醫護人員判斷為準。</small></p>
      </div>
      <p v-else class="muted">{{ loading ? 'AI 分析中，約需幾秒…' : '送出後，結果會出現在這裡。醫師會在「醫師查看」看到卡片。' }}</p>
    </div>
  </div>
</template>

<style scoped>
.example { font-size: .9rem; padding: .4rem .8rem; }
textarea { resize: vertical; }
.field.invalid input, .field.invalid select, .field.invalid textarea { border-color: var(--bad); box-shadow: 0 0 0 4px rgba(255,59,48,.14); }
</style>
