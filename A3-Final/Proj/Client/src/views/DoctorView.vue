<script setup>
// ③ 醫師查看：模擬 EHR。打開頁面就讀目前病人，並照 CDS Hooks 2.0 流程
//   Discovery（GET /cds-services）→ 對每個 patient-view 服務 POST hook → 顯示卡片。
import { ref, onMounted } from 'vue';
import { call } from '../api';
import { usePatientId, useOrgId, usePractitioner, useMode } from '../composables/usePatientId';

const patientId = usePatientId();
const orgId = useOrgId();
const doctor = usePractitioner();
const mode = useMode();
const general = mode.value === 'general'; // 一般使用：要先在「醫師端」登入，病人從本機構清單點選
const orgList = ref(null); // 本機構的所有病人：{ organization, total, patients[] } 或 { error }
const patient = ref(null);
const cards = ref([]);
const loading = ref(false);
const error = ref('');

const ACCEPT_EXT = 'http://example.org/fhir/ai-triage/accept'; // 卡片建議裡，後端附的「接受」捷徑
const GENDER = { male: '男', female: '女', other: '其他', unknown: '不詳' };
const INDICATOR = { critical: '緊急', warning: '注意', info: '資訊' };

// 卡片 detail 是 Markdown，後端有跳脫特殊符號；這裡用純文字顯示，把跳脫用的反斜線拿掉
const plain = (s) => (s || '').replace(/\\([<>&[\]()`*_])/g, '$1').replace(/\n\n/g, '\n'); // Markdown 段落 → 一行一項

function displayName(p) {
  const n = p.name?.find(x => x.use === 'official') || p.name?.[0]; // TW Core 的 name 依 use 分 slice
  return n?.text || [n?.family, ...(n?.given || [])].filter(Boolean).join(' ') || '（無姓名）';
}

async function load() {
  if (!patientId.value) return;
  loading.value = true;
  error.value = '';
  cards.value = [];
  patient.value = null;

  const p = await call('get', `/api/twcore/patient/${encodeURIComponent(patientId.value)}`);
  if (p.resourceType !== 'Patient') { error.value = p.error; loading.value = false; return; }
  patient.value = p;

  const discovery = await call('get', '/cds-services');
  for (const service of (discovery.services || []).filter(s => s.hook === 'patient-view')) {
    const r = await call('post', `/cds-services/${service.id}`, {
      hook: 'patient-view',
      hookInstance: crypto.randomUUID(),
      // 看病歷的醫師：登入的醫師優先，否則用病人的主治醫師
      context: { userId: doctor.id.value ? `Practitioner/${doctor.id.value}` : (p.generalPractitioner?.[0]?.reference || 'Practitioner/example-doctor'), patientId: p.id },
      prefetch: { patient: p } // key 對齊 Discovery；triageObservation 不帶，讓服務自己查
    });
    if (r.cards) cards.value.push(...r.cards.map(c => ({ ...c, service: service.id, suggestions: (c.suggestions || []).map(withTime) })));
    else error.value = '分流建議讀取失敗，無法確認病人狀況，不能當成沒事。'; // 查不到不能顯示成沒事
  }
  // 重要的放最上面：緊急 → 注意 → 資訊
  const rank = { critical: 0, warning: 1, info: 2 };
  cards.value.sort((a, b) => (rank[a.indicator] ?? 3) - (rank[b.indicator] ?? 3));
  loading.value = false;
}

// 查同一機構的所有病人（Patient?organization=），點名字就切換病人
async function loadOrg() {
  if (!orgId.value) return;
  const r = await call('get', `/api/twcore/organization/${encodeURIComponent(orgId.value)}/patients`);
  orgList.value = r.success ? r : { error: r.error };
}
// 回診建議帶時間欄位，醫師可以改（預設照後端建議的三天後）；datetime-local 要本地時間字串
const local = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const withTime = (s) => (s.actions?.[0]?.resource?.resourceType === 'Appointment' ? { ...s, start: local(s.actions[0].resource.start) } : s);

// 醫師接受卡片建議（CDS Hooks suggestion）：按一下，後端建立 Task／Appointment，並照規格回報 feedback
async function accept(c, s) {
  const how = s.extension?.[ACCEPT_EXT];
  if (!how || !String(how.endpoint).startsWith('/api/twcore/')) { s.done = '這個建議無法自動執行'; return; } // 只打自己的後端
  const body = { ...how.body };
  if ('start' in s) {
    const d = new Date(s.start);
    if (isNaN(d) || d <= new Date()) { s.failed = '回診時間要在未來'; return; }
    body.start = d.toISOString();
  }
  s.busy = true;
  const r = await call('post', how.endpoint, body);
  s.busy = false;
  const type = s.actions?.[0]?.resource?.resourceType || '';
  if (!r.success) { s.failed = r.issues?.[0]?.message || r.error || '建立失敗'; return; }
  s.done = `${r.reused ? '已經有了，沿用' : '已建立'} ${type}/${r.id}`;
  call('post', `/cds-services/${c.service}/feedback`, { feedback: [{ card: c.uuid, outcome: 'accepted', acceptedSuggestions: [{ id: s.uuid }], outcomeTimestamp: new Date().toISOString() }] });
}

function pick(id) {
  patientId.value = id;
  load();
}

onMounted(() => { load(); loadOrg(); });
</script>

<template>
  <div class="page" :class="{ split: general ? doctor.id.value : patientId }">
    <div v-if="general && !doctor.id.value" class="alert warning">
      請先到 <router-link to="/login">醫師端</router-link> 選擇機構並登入，才能查看病人。
    </div>
    <div v-else-if="!general && !patientId" class="alert warning">
      還沒有病人。請先到 <router-link to="/setup">① 建立資料</router-link> 建立一位病人。
    </div>

    <template v-else>
      <div>
      <div class="panel">
        <h1>{{ general ? '醫師查看' : '③ 醫師查看' }}</h1>
        <p class="lead">打開病歷時，系統自動詢問 AI 分流服務（CDS Hooks），有需要注意的事會以卡片顯示。<template v-if="general"> 登入醫師：{{ doctor.name.value }}。</template></p>
        <p v-if="general && !patientId" class="alert info">請從右邊的清單點一位病人。</p>
        <div v-if="patient" class="facts">
          <p><strong>姓名</strong><br>{{ displayName(patient) }}</p>
          <p><strong>性別</strong><br>{{ GENDER[patient.gender] || '不詳' }}</p>
          <p><strong>生日</strong><br>{{ patient.birthDate || '不詳' }}</p>
          <p><strong>病人代號</strong><br>{{ patient.id }}</p>
        </div>
        <div v-if="patientId" class="actions"><button class="btn ghost" @click="load" :disabled="loading">{{ loading ? '讀取中…' : '重新整理' }}</button></div>
        <div v-if="error" class="alert error">{{ error }}</div>
      </div>

      <div v-for="(c, i) in cards" :key="c.uuid || i" class="alert" :class="c.indicator">
        <h3><span class="tag" :class="c.indicator">【{{ INDICATOR[c.indicator] }}】</span>{{ c.summary }}</h3>
        <p class="detail">{{ plain(c.detail) }}</p>
        <div v-for="s in c.suggestions" :key="s.uuid" class="suggest">
          <button class="btn" :disabled="s.busy || s.done" @click="accept(c, s)">{{ s.busy ? '建立中…' : s.label }}</button>
          <label v-if="'start' in s" class="when">回診時間 <input type="datetime-local" v-model="s.start" :disabled="s.busy || s.done" /></label>
          <span v-if="s.done" class="ok">✓ {{ s.done }}</span>
          <span v-else-if="s.failed" class="bad">✗ {{ s.failed }}</span>
        </div>
        <small>來源：{{ c.source?.label }}</small>
      </div>
      </div>

      <!-- 右欄：同機構的病人 -->
      <div class="panel side">
        <h3>本機構的病人</h3>
        <p v-if="!orgId" class="muted">{{ general ? '登入後這裡會列出本機構的所有病人。' : '在「① 建立資料」建好機構後，這裡會列出同機構的所有病人。' }}</p>
        <div v-else-if="orgList?.error" class="alert error">{{ orgList.error }}</div>
        <template v-else-if="orgList">
          <p class="muted">{{ orgList.organization.name }}（Organization/{{ orgList.organization.id }}），共 {{ orgList.total }} 位</p>
          <ul class="patients">
            <li v-for="p in orgList.patients" :key="p.id">
              <button class="link" :class="{ current: p.id === patientId }" @click="pick(p.id)">
                <strong>{{ p.name || '（無姓名）' }}</strong>　{{ GENDER[p.gender] || '不詳' }}・{{ p.birthDate || '生日不詳' }}<br>
                <small>{{ p.id }}</small>
              </button>
            </li>
          </ul>
        </template>
        <p v-else class="muted">讀取中…</p>
        <button v-if="orgId" class="btn ghost" @click="loadOrg">重新查詢</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail { white-space: pre-line; line-height: 1.7; margin: .3rem 0; }
.suggest { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .5rem .8rem; margin: .6rem 0; }
.suggest .when { display: inline-flex; align-items: center; gap: .5rem; font-size: .9rem; color: var(--muted); white-space: nowrap; }
.suggest .when input { width: auto; padding: .4rem .6rem; }
@media (max-width: 600px) { .suggest { grid-template-columns: 1fr; } }
.suggest .ok { color: var(--ok); font-weight: 500; } .suggest .bad { color: var(--bad); }
.tag { font-size: .85rem; font-weight: 600; margin-right: .3rem; color: var(--muted); }
.tag.critical { color: var(--bad); } .tag.warning { color: var(--warn); } .tag.info { color: var(--accent); }
.facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0 1rem; }
.facts p { margin: .4rem 0; }
@media (max-width: 600px) { .facts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.alert h3 { margin: 0 0 .3rem; }
.patients { list-style: none; padding: 0; margin: 0 0 .8rem; max-height: 60vh; overflow: auto; }
.patients .link { width: 100%; text-align: left; background: none; border: 1px solid transparent; border-radius: 12px; padding: .5rem .7rem; font: inherit; cursor: pointer; color: var(--text); }
.patients .link:hover { background: rgba(255,255,255,.6); }
.patients .link.current { border-color: rgba(10,132,255,.35); background: rgba(255,255,255,.8); }
.facts p strong { color: var(--muted); font-weight: 500; font-size: .9rem; }
</style>
