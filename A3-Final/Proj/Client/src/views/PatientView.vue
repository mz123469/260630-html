<script setup>
// ② 病人回報：病人用自己的話描述狀況 → 後端請 AI 分析 → 存成 TW Core Observation。
import { ref, onMounted, nextTick } from 'vue';
import { call } from '../api';
import { usePatientId } from '../composables/usePatientId';

const patientId = usePatientId();
const patientText = ref('');
const result = ref(null);
const loading = ref(false);
const errorMsg = ref('');
const missing = ref(false); // 瀏覽器記得的病人，FHIR Server 上已經沒有了

// 一進頁面先確認病人還在，不要讓使用者寫完一大段才發現送不出去
onMounted(async () => {
  if (!patientId.value) return;
  const r = await call('get', `/api/twcore/patient/${encodeURIComponent(patientId.value)}`);
  missing.value = r.success === false && r.error?.startsWith('找不到');
});

// 點一下就填入，第一次用的人不用想要寫什麼
const EXAMPLES = [
  '我吃了新開的血壓藥之後頭很暈，剛剛差點在浴室跌倒，我很害怕。',
  '傷口復原得不錯，已經不痛了，想問下禮拜可以開始運動嗎？',
  '沒事啦，就是這幾天爬樓梯常常喘不過氣，大概是天氣太熱。'
];

// 跟醫師端卡片同一套門檻：>= 8 紅、>= 5 或需人工介入 橘、其他綠
function level(d) {
  if (d.urgency_score >= 8) return { cls: 'critical', text: '請盡快就醫或撥打 119' };
  if (d.urgency_score >= 5 || d.needs_human_intervention) return { cls: 'warning', text: '醫護人員會主動與您聯繫' };
  return { cls: 'ok', text: '已記錄，醫護人員會在回診時查看' };
}

async function submit() {
  errorMsg.value = '';
  result.value = null;
  if (!patientText.value.trim()) { errorMsg.value = '請先描述您現在的身體狀況'; return; }
  loading.value = true;
  const r = await call('post', '/api/triage/analyze', { patientText: patientText.value, patientId: patientId.value });
  loading.value = false;
  if (r.success) result.value = r;
  else errorMsg.value = r.error; // 失敗就說失敗，絕不顯示成低風險
  await nextTick();
  document.querySelector('.side')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // 手機上結果在下面，自動捲過去
}
</script>

<template>
  <div class="page" :class="{ split: patientId && !missing }">
    <div v-if="!patientId" class="alert warning">
      還沒有病人。請先到 <router-link to="/setup">① 建立資料</router-link> 建立一位病人。
    </div>

    <div v-else-if="missing" class="alert warning">
      找不到病人 {{ patientId }}（可能伺服器資料被清掉了）。請到 <router-link to="/setup">① 建立資料</router-link> 重新建立。
    </div>

    <template v-else>
    <div class="panel">
      <h1>② 病人回報</h1>
      <p class="lead">請用平常說話的方式，寫下您現在的感覺。</p>

      <div class="field">
        <label for="text">您現在覺得怎麼樣？</label>
        <textarea id="text" v-model="patientText" rows="5" maxlength="3000"></textarea>
        <small>不用寫姓名、身分證或電話。不知道怎麼寫？點下面的例子：</small>
      </div>
      <div class="actions">
        <button v-for="e in EXAMPLES" :key="e" class="btn ghost example" @click="patientText = e">{{ e.slice(0, 14) }}…</button>
      </div>
      <div class="actions">
        <button class="btn" @click="submit" :disabled="loading">{{ loading ? 'AI 分析中…' : '送出' }}</button>
      </div>

    </div>

    <!-- 右欄：結果。左邊寫、右邊看，不用往下捲找結果 -->
    <div class="panel side">
      <h3>結果</h3>
      <div v-if="errorMsg" class="alert error">{{ errorMsg }}</div>
      <div v-else-if="result" class="alert" :class="level(result.data).cls">
        <h3>{{ level(result.data).text }}</h3>
        <p>急迫程度 <strong>{{ result.data.urgency_score }}</strong> / 10　·　情緒：{{ result.data.emotion }}</p>
        <p>給醫師的摘要：{{ result.data.summary }}</p>
        <p v-if="result.alert_simulated"><small>（示範模式：通知只印在後端終端機，沒有真的送出 LINE）</small></p>
        <p><small>已存檔：Encounter/{{ result.encounter_id }}、Condition/{{ result.condition_id }}、Observation/{{ result.fhir_reference }}。AI 判讀僅供參考，以醫護人員判斷為準。</small></p>
        <router-link to="/doctor">到 ③ 醫師查看 →</router-link>
      </div>
      <p v-else class="muted">{{ loading ? 'AI 分析中，約需幾秒…' : '送出後，結果會出現在這裡。' }}</p>
    </div>
    </template>
  </div>
</template>

<style scoped>
.example { font-size: .9rem; padding: .4rem .8rem; }
textarea { resize: vertical; }
</style>
