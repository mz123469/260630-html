<script setup>
// ④ 匯入聯測 JSON（聯測松 Track 1）：FHIRfox Simplified JSON → TW Core 1.0.0 Bundle → 驗證 → 上傳。
// 單頁、由上到下五步：貼上或選檔 → 預覽（來源與 FHIR 並排）→ 驗證 → 上傳 → 資源網址。
// 每步標題前有狀態點（灰＝還沒做、藍＝進行中、綠＝通過、紅＝有錯），錯誤寫出「第幾筆 型別/id.欄位」。
// 轉換規則是官方 FHIRfox 的 CSV（後端 fhir/fhirfox/），驗證用官方 validator_cli（services/twcoreValidator.js）。
import { ref, computed, nextTick } from 'vue';
import { call } from '../api';
import { usePatientId, useOrgId } from '../composables/usePatientId';

const patientId = usePatientId();
const orgId = useOrgId();

const text = ref('');
const res = ref({ convert: null, validate: null, upload: null }); // 每一步的後端回應
const busy = ref('');            // 正在做哪一步
const selected = ref(0);         // 預覽選到第幾筆
const SEVERITY = { fatal: '錯誤', error: '錯誤', warning: '警告', information: '資訊' };

// 改了 JSON，後面的步驟全部作廢，要從預覽重新來
function reset() { res.value = { convert: null, validate: null, upload: null }; selected.value = 0; }

// 先在瀏覽器解析，JSON 語法錯就不用送後端
function parse() {
  try { return { data: JSON.parse(text.value) }; }
  catch (e) { return { error: `JSON 格式錯誤：${e.message}` }; }
}
const source = computed(() => { const p = parse(); return Array.isArray(p.data) ? p.data : p.data?.resources || []; });

async function sample() {
  const r = await call('get', '/api/fhirfox/sample');
  if (Array.isArray(r)) { text.value = JSON.stringify(r, null, 2); reset(); }
}
function pickFile(e) {
  const file = e.target.files?.[0];
  e.target.value = ''; // 同一個檔案改過可以再選一次
  if (!file) return;
  reset();
  if (file.size > 1024 * 1024) { res.value.convert = { success: false, error: `檔案 ${Math.ceil(file.size / 1024)} KB，超過 1 MB`, issues: [] }; return; }
  const reader = new FileReader();
  reader.onload = () => { text.value = String(reader.result); };
  reader.readAsText(file, 'utf-8');
}

async function run(kind) {
  const p = parse();
  if (p.error) { reset(); res.value.convert = { success: false, error: p.error, issues: [] }; return; }
  if (kind === 'upload' && !window.confirm('上傳到共用的 FHIR Server？\n只能用假資料。機構、醫師、病人已存在會沿用；其他資料每上傳一次就新增一份。')) return;
  busy.value = kind;
  const r = await call('post', `/api/fhirfox/${kind}`, p.data);
  busy.value = '';
  res.value[kind] = r;
  if (kind === 'convert') { res.value.validate = null; res.value.upload = null; selected.value = 0; }
  if (kind === 'upload' && r.success) {
    if (r.patientId) patientId.value = r.patientId; // ② 病人回報、③ 醫師查看 直接用這位病人
    if (r.organizationId) orgId.value = r.organizationId;
  }
  await nextTick();
  document.getElementById(`step-${kind}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 每一步的狀態點
const state = (kind, ready = true) => busy.value === kind ? 'run' : !ready ? 'off' : !res.value[kind] ? 'todo' : res.value[kind].success ? 'ok' : 'bad';
const converted = computed(() => res.value.convert?.success);
const validated = computed(() => res.value.validate?.success);
const uploaded = computed(() => res.value.upload?.success);

const map = computed(() => res.value.convert?.map || []);
const pick = computed(() => map.value[selected.value]);
const fhirOf = (m) => res.value.convert?.bundle?.entry?.find(e => e.fullUrl === m.fullUrl)?.resource;
const pretty = (v) => (v ? JSON.stringify(v, null, 2) : '');
const count = (issues, s) => (issues || []).filter(i => (s === 'error' ? ['error', 'fatal'] : [s]).includes(i.severity)).length;

const links = computed(() => res.value.upload?.map || []);
const urls = computed(() => links.value.filter(m => m.url).map(m => m.url).join('\n'));
const copied = ref(false);
async function copyUrls() {
  try { await navigator.clipboard.writeText(urls.value); copied.value = true; setTimeout(() => { copied.value = false; }, 1500); }
  catch { /* 瀏覽器不准複製時，文字框可以自己選取 */ }
}
</script>

<template>
  <div class="page">
    <!-- 1 貼上 -->
    <section class="panel" id="step-input">
      <h1>④ 匯入聯測 JSON</h1>
      <p class="lead">把 FHIRfox 的 Simplified JSON 轉成 TW Core 1.0.0，驗證通過再上傳。由上往下做五步；第一次用就按「填入範例」。</p>
      <h3><span class="dot" :class="text ? 'ok' : 'todo'"></span>1 貼上 JSON 或選檔案</h3>
      <textarea v-model="text" @input="reset" rows="12" spellcheck="false" aria-label="Simplified JSON" placeholder='[ { "id": "1", "resourceType": "patient", "idNumber": "A123456789", ... } ]'></textarea>
      <p class="hint">一個陣列，或 {"resources": [...]}；最多 100 筆、1 MB。參照只能指向同一份資料裡的 id。</p>
      <div class="actions">
        <button class="btn ghost" @click="sample" :disabled="!!busy">填入範例</button>
        <label class="btn ghost">選擇檔案<input type="file" accept=".json,application/json" @change="pickFile" hidden /></label>
        <button class="btn" @click="run('convert')" :disabled="!!busy || !text">{{ busy === 'convert' ? '轉換中…' : '下一步：預覽 ↓' }}</button>
      </div>
    </section>

    <!-- 2 預覽：來源與 FHIR 並排 -->
    <section class="panel" id="step-convert">
      <h3><span class="dot" :class="state('convert', !!text)"></span>2 預覽：來源與 FHIR 並排</h3>
      <p v-if="!res.convert" class="muted">按上面的「下一步：預覽」。</p>
      <template v-else>
        <div class="alert" :class="converted ? 'ok' : 'error'">
          {{ converted ? `✓ 轉成 ${map.length} 筆 FHIR 資源。點下面任一筆，左右對照。` : `✗ ${res.convert.error}` }}
        </div>
        <ul v-if="res.convert.issues?.length" class="issues">
          <li v-for="(i, n) in res.convert.issues" :key="n" :class="i.severity">【{{ SEVERITY[i.severity] || i.severity }}】<code v-if="i.location">{{ i.location }}</code> {{ i.message }}</li>
        </ul>
        <div v-if="map.length" class="list">
          <button v-for="(m, n) in map" :key="m.fullUrl" :class="{ on: n === selected }" @click="selected = n">
            <span class="muted">[{{ m.index }}]</span> {{ m.sourceType }}/{{ m.sourceId }} → <strong>{{ m.resourceType }}</strong>
          </button>
        </div>
        <div v-if="pick" class="two">
          <div><h4>來源（Simplified JSON 第 {{ pick.index }} 筆）</h4><pre>{{ pretty(source[pick.index]) }}</pre></div>
          <div><h4>FHIR（{{ pick.profile.split('/').pop() || pick.resourceType }}）</h4><pre>{{ pretty(fhirOf(pick)) }}</pre></div>
        </div>
      </template>
    </section>

    <!-- 3 驗證 -->
    <section class="panel" id="step-validate">
      <h3><span class="dot" :class="state('validate', converted)"></span>3 驗證（官方 validator，TW Core 1.0.0）</h3>
      <p class="muted">Error 為 0 才能上傳。每次約 15 秒。</p>
      <div class="actions"><button class="btn" @click="run('validate')" :disabled="!!busy || !converted">{{ busy === 'validate' ? '驗證中…' : '驗證' }}</button></div>
      <template v-if="res.validate">
        <div class="alert" :class="validated ? 'ok' : 'error'">
          {{ validated ? '✓ 驗證通過，可以上傳' : `✗ ${res.validate.error}` }}
          <p class="muted">錯誤 {{ count(res.validate.issues, 'error') }}、警告 {{ count(res.validate.issues, 'warning') }}、資訊 {{ count(res.validate.issues, 'information') }}</p>
        </div>
        <ul v-if="count(res.validate.issues, 'error') + count(res.validate.issues, 'warning')" class="issues">
          <li v-for="(i, n) in res.validate.issues.filter(x => x.severity !== 'information')" :key="n" :class="i.severity">【{{ SEVERITY[i.severity] || i.severity }}】<code v-if="i.location">{{ i.location }}</code> {{ i.message }}</li>
        </ul>
      </template>
    </section>

    <!-- 4 上傳 -->
    <section class="panel" id="step-upload">
      <h3><span class="dot" :class="state('upload', validated)"></span>4 上傳到 FHIR Server</h3>
      <p class="muted">整包一次寫入（transaction）：失敗就全部不寫，不會留下半套。</p>
      <div class="actions"><button class="btn" @click="run('upload')" :disabled="!!busy || !validated || uploaded">{{ busy === 'upload' ? '上傳中…' : uploaded ? '已上傳' : '上傳' }}</button></div>
      <div v-if="res.upload" class="alert" :class="uploaded ? 'ok' : 'error'">
        <template v-if="uploaded">✓ 已上傳 {{ links.length }} 筆（{{ links.filter(m => m.reused).length }} 筆伺服器上已有、沿用）。病人 {{ res.upload.patientId }} 已設為目前病人，可以接著做 <router-link to="/">② 病人回報</router-link>。</template>
        <template v-else>✗ {{ res.upload.error }}</template>
        <ul v-if="!uploaded && res.upload.issues?.length"><li v-for="(i, n) in res.upload.issues" :key="n"><code v-if="i.location">{{ i.location }}</code> {{ i.message }}</li></ul>
      </div>
    </section>

    <!-- 5 資源網址 -->
    <section class="panel" id="step-links">
      <h3><span class="dot" :class="uploaded ? 'ok' : 'off'"></span>5 每筆資源的網址（貼到 FHIRfox 驗證）</h3>
      <p v-if="!uploaded" class="muted">上傳成功後在這裡列出。</p>
      <template v-else>
        <ol class="urllist">
          <li v-for="m in links" :key="m.fullUrl"><span class="muted">[{{ m.index }}] {{ m.sourceType }}/{{ m.sourceId }} →</span> <a :href="m.url" target="_blank" rel="noopener">{{ m.resourceType }}/{{ m.id }}</a> <span class="tag">{{ m.reused ? '沿用' : '新建' }}</span></li>
        </ol>
        <textarea class="urls" :value="urls" rows="4" readonly aria-label="全部網址"></textarea>
        <div class="actions"><button class="btn ghost" @click="copyUrls">{{ copied ? '已複製' : '複製全部網址' }}</button></div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.page { max-width: 1100px; }
textarea { font-family: 'SF Mono', Menlo, monospace; font-size: .85rem; }
.hint { color: var(--muted); font-size: .88rem; margin: .3rem 0 0; }
/* 狀態點：跟訊息卡左上角的小色點同一套顏色 */
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: .5rem; vertical-align: middle; background: var(--line); }
.dot.todo { background: var(--muted); } .dot.run { background: var(--info); animation: blink 1s infinite; }
.dot.ok { background: var(--ok); } .dot.bad { background: var(--bad); } .dot.off { background: var(--line); }
@keyframes blink { 50% { opacity: .3; } }
section h3 { margin-top: 0; }
.issues { max-height: 320px; overflow: auto; padding-left: 1.1rem; margin: .4rem 0; font-size: .9rem; line-height: 1.5; overflow-wrap: anywhere; }
.issues li.error, .issues li.fatal { color: var(--bad); }
.list { display: flex; flex-wrap: wrap; gap: .4rem; margin: .8rem 0; }
.list button { font: inherit; font-size: .88rem; padding: .35rem .7rem; border-radius: 999px; border: 1px solid var(--line); background: rgba(255,255,255,.6); cursor: pointer; }
.list button.on { background: #fff; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(10,132,255,.15); }
.two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; }
@media (max-width: 820px) { .two { grid-template-columns: minmax(0, 1fr); } }
.two h4 { margin: 0 0 .4rem; font-size: .95rem; color: var(--muted); font-weight: 600; }
pre { margin: 0; max-height: 480px; overflow: auto; background: rgba(255,255,255,.7); border: 1px solid var(--line); border-radius: 12px; padding: .8rem; font-size: .8rem; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.urllist { padding-left: 1.3rem; line-height: 1.8; overflow-wrap: anywhere; }
.tag { font-size: .8rem; color: var(--ok); }
.urls { margin-top: .5rem; }
</style>
