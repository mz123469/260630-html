<script setup>
// 導覽列：最左邊切換「一般使用｜聯測順序」兩種模式；中間是該模式的頁面；右邊一直顯示目前病人與醫師，使用者不用記 ID。
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePatientId, useOrgId, usePractitioner, useMode } from './composables/usePatientId';
const patientId = usePatientId();
const orgId = useOrgId();
const doctor = usePractitioner();
const mode = useMode();
const router = useRouter();
const route = useRoute();

const PAGES = {
  general: [['/patient', '病人端'], ['/login', '醫師端'], ['/doctor', '醫師查看']],
  connectathon: [['/setup', '① 建立資料'], ['/', '② 病人回報'], ['/doctor', '③ 醫師查看'], ['/import', '④ 匯入 JSON']]
};
const pages = computed(() => PAGES[mode.value]);
// 切換模式就跳到該模式的第一頁；網址屬於另一個模式時也跟著切（例如直接打 /setup）
function setMode(m) { mode.value = m; router.push(PAGES[m][0][0]); }
watch(() => route.path, (p) => {
  const owner = Object.keys(PAGES).find(m => PAGES[m].some(([path]) => path === p && path !== '/doctor'));
  if (owner && owner !== mode.value) mode.value = owner;
}, { immediate: true });

// 重新開始：清掉這台瀏覽器記住的病人、機構、醫師和畫面上的表單，回到第一頁。
// FHIR Server 上的資料不刪（共用測試伺服器，刪了也會影響別人；再建同一筆時系統會問要不要更新）
const resets = ref(0);
function restart() {
  if (!window.confirm('清除這台瀏覽器記住的病人、機構與醫師，回到第一頁重新開始？\n（FHIR Server 上已建立的資料不會刪除）')) return;
  patientId.value = ''; orgId.value = ''; doctor.id.value = ''; doctor.name.value = '';
  resets.value++; // 換 key 讓頁面重建，表單和結果一起清空
  router.push(pages.value[0][0]);
}
</script>

<template>
  <nav class="nav">
    <div class="logo">AI 分流系統</div>
    <div class="modes" role="tablist">
      <button :class="{ on: mode === 'general' }" @click="setMode('general')">一般使用</button>
      <button :class="{ on: mode === 'connectathon' }" @click="setMode('connectathon')">聯測順序</button>
    </div>
    <div class="links">
      <router-link v-for="[path, label] in pages" :key="path" :to="path">{{ label }}</router-link>
    </div>
    <div class="current">
      <span>病人：<strong v-if="patientId">{{ patientId }}</strong><span v-else class="warn">尚未建立</span></span>
      <span v-if="mode === 'general'">醫師：<strong v-if="doctor.id.value">{{ doctor.name.value }}</strong><span v-else class="warn">未登入</span></span>
      <button class="restart" @click="restart">重新開始</button>
    </div>
  </nav>
  <main class="main"><router-view :key="resets + mode" /></main>
</template>

<style>
/* 視覺：Apple 風格玻璃（參考 rdev/liquid-glass-react 的作法：背景模糊＋飽和、半透明白、細白邊、頂部高光；
   不做折射位移，Safari／Firefox 不支援而且會影響可讀性）。顏色只用在小標籤與按鈕，不整塊上色。 */
:root {
  --text: #1d1d1f; --muted: #6e6e73; --accent: #0a84ff;
  --ok: #34c759; --warn: #ff9f0a; --bad: #ff3b30; --info: #5ac8fa;
  --glass: rgba(255,255,255,.58); --glass-strong: rgba(255,255,255,.78); --edge: rgba(255,255,255,.75);
  --line: rgba(60,60,67,.14); --radius: 20px;
  --shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 12px 32px rgba(31,41,55,.10), 0 1px 2px rgba(31,41,55,.06);
}
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, 'SF Pro Text', 'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', system-ui, sans-serif; color: var(--text); background: #e8ecf2; min-height: 100vh; -webkit-font-smoothing: antialiased; }
/* 背景：兩團柔光，讓玻璃有東西可以透 */
body::before, body::after { content: ''; position: fixed; z-index: -1; border-radius: 50%; filter: blur(80px); opacity: .55; pointer-events: none; }
body::before { width: 60vw; height: 60vw; left: -15vw; top: -20vw; background: radial-gradient(circle, #bcd4ff, transparent 65%); }
body::after { width: 55vw; height: 55vw; right: -15vw; bottom: -20vw; background: radial-gradient(circle, #c9f0dc, transparent 65%); }

.glass, .nav, .panel { background: var(--glass); -webkit-backdrop-filter: blur(24px) saturate(160%); backdrop-filter: blur(24px) saturate(160%); border: 1px solid var(--edge); box-shadow: var(--shadow); }

/* 導覽列：浮在上方的玻璃條；三個頁面是一組分段控制，目前頁面是白色膠囊 */
.nav { position: relative; z-index: 10; margin: .75rem auto 0; max-width: 1100px; display: flex; flex-wrap: wrap; gap: .8rem; align-items: center; justify-content: space-between; padding: .55rem .9rem .55rem 1.1rem; border-radius: 999px; }
.logo { font-weight: 600; font-size: 1.05rem; letter-spacing: .01em; }
.links { display: flex; gap: .15rem; padding: .2rem; border-radius: 999px; background: rgba(60,60,67,.08); }
.links a { color: var(--muted); text-decoration: none; white-space: nowrap; padding: .4rem .95rem; border-radius: 999px; font-size: .95rem; font-weight: 500; transition: background .2s, color .2s; }
.links a.router-link-exact-active { background: #fff; color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.current { font-size: .9rem; color: var(--muted); display: flex; align-items: center; gap: .5rem; }
.current strong { color: var(--text); font-weight: 600; }
.current .warn { color: var(--warn); font-weight: 600; text-decoration: none; }
/* 模式切換：跟頁面分段控制同一種膠囊，但字小一點、灰一點，表示它是「設定」不是「步驟」 */
.modes { display: flex; gap: .15rem; padding: .2rem; border-radius: 999px; background: rgba(60,60,67,.08); }
.modes button { font: inherit; font-size: .85rem; font-weight: 500; color: var(--muted); background: none; border: none; border-radius: 999px; padding: .35rem .8rem; cursor: pointer; }
.modes button.on { background: #fff; color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.restart { font: inherit; font-size: .85rem; padding: .35rem .8rem; border-radius: 999px; border: 1px solid var(--line); background: rgba(255,255,255,.5); color: var(--text); cursor: pointer; }
.restart:hover { background: #fff; }
.main { padding: 1.25rem 1rem 3rem; }
@media (max-width: 700px) { .nav { margin: .5rem .5rem 0; padding: .5rem .7rem; gap: .5rem; border-radius: 22px; } .links { width: 100%; justify-content: space-between; flex-wrap: wrap; } .links a { padding: .4rem .45rem; font-size: .85rem; } .current { width: 100%; justify-content: space-between; flex-wrap: wrap; } }

/* 三個頁面共用的元件樣式 */
.page { max-width: 760px; margin: 0 auto; }
.page.split { max-width: 1100px; display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 0 1.2rem; align-items: start; }
.page.split > .side { position: sticky; top: 1rem; }  /* 左邊填、右邊看結果：視線由左到右 */
@media (max-width: 820px) { .page.split { grid-template-columns: 1fr; } .page.split > .side { position: static; } }
.muted { color: var(--muted); }
.page.wide { max-width: 1100px; }
.side h3 { margin-top: 0; }
.panel { border-radius: var(--radius); padding: 1.5rem 1.7rem; margin-bottom: 1rem; }
.page h1 { font-size: 1.6rem; font-weight: 700; letter-spacing: -.01em; margin: 0 0 .3rem; }
.page h3 { font-size: 1.05rem; font-weight: 600; margin: 1.2rem 0 .5rem; }
.lead { color: var(--muted); margin: 0 0 1.2rem; line-height: 1.6; }
.field { display: flex; flex-direction: column; gap: .3rem; margin-bottom: .8rem; }
.field label { font-weight: 500; font-size: .92rem; color: var(--muted); }
.field small { color: var(--muted); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0 1rem; }
input, select, textarea { font: inherit; padding: .65rem .8rem; border: 1px solid var(--line); border-radius: 12px; background: rgba(255,255,255,.75); width: 100%; transition: box-shadow .15s, border-color .15s; }
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 4px rgba(10,132,255,.18); }
.btn { font: inherit; font-size: 1rem; font-weight: 600; padding: .65rem 1.4rem; border: none; border-radius: 999px; background: linear-gradient(180deg, #3a9bff, var(--accent)); color: #fff; cursor: pointer; box-shadow: 0 1px 0 rgba(255,255,255,.35) inset, 0 6px 16px rgba(10,132,255,.28); transition: transform .12s, box-shadow .12s, opacity .2s; }
.btn:hover { transform: translateY(-1px); } .btn:active { transform: scale(.98); }
.btn:disabled { opacity: .55; cursor: wait; transform: none; }
.btn.ghost { background: rgba(255,255,255,.65); color: var(--text); border: 1px solid var(--line); box-shadow: 0 1px 0 rgba(255,255,255,.8) inset; }
.actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .6rem; }

/* 訊息卡：同一塊玻璃，只用左上角的小色點與標籤表示等級，不整塊上色 */
.alert { position: relative; padding: .9rem 1rem .9rem 1.4rem; border-radius: 14px; margin: .8rem 0; background: rgba(255,255,255,.55); border: 1px solid var(--edge); box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 4px 14px rgba(31,41,55,.06); line-height: 1.55; }
.alert::before { content: ''; position: absolute; left: .6rem; top: 1.15rem; width: 8px; height: 8px; border-radius: 50%; background: var(--muted); }
.alert.ok::before { background: var(--ok); } .alert.info::before { background: var(--info); }
.alert.warning::before { background: var(--warn); } .alert.critical::before, .alert.error::before { background: var(--bad); }
.alert.critical { border-color: rgba(255,59,48,.35); } .alert.warning { border-color: rgba(255,159,10,.35); }
.alert h3 { margin: 0 0 .35rem; font-size: 1.05rem; }
.alert p { margin: .25rem 0; }
.alert ul { margin: .4rem 0 0; padding-left: 1.2rem; }
.alert a { color: var(--accent); text-decoration: none; font-weight: 500; }
code { font-family: 'SF Mono', Menlo, monospace; font-size: .85em; background: rgba(60,60,67,.08); padding: .05em .35em; border-radius: 6px; }
</style>
