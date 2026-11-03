<script setup>
// 醫師端（一般使用）：選機構、填姓名與證書字號，按「進入」。
// 後端用既有端點：機構、醫師已經有就沿用（reuse，不覆蓋）、沒有就建立；再建一筆醫師職務（PractitionerRole）。
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { call } from '../api';
import { useOrgId, usePractitioner } from '../composables/usePatientId';

const router = useRouter();
const orgId = useOrgId();
const doctor = usePractitioner();
const form = reactive({ orgCode: '', name: '', licenseNumber: '' });
const orgCodes = ref([]);
onMounted(async () => {
  const r = await call('get', '/api/twcore/organization-codes');
  if (Array.isArray(r)) orgCodes.value = r;
});
const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
const fillExample = () => Object.assign(form, { orgCode: '0131060029', name: '王醫師', licenseNumber: `醫字第0${digits(5)}號` });

const busy = ref(false);
const errorMsg = ref('');
const issues = ref([]);
const FIELD = { 'Organization.identifier[0].value': 'orgCode', 'Practitioner.name[0].text': 'name', 'Practitioner.identifier[0].value': 'licenseNumber' };
const invalid = computed(() => new Set(issues.value.map(i => FIELD[i.location]).filter(Boolean)));

async function login() {
  errorMsg.value = ''; issues.value = [];
  const missing = [['orgCode', '醫療機構'], ['name', '姓名'], ['licenseNumber', '證書字號']].filter(([k]) => !form[k]).map(([, l]) => l);
  if (missing.length) { errorMsg.value = `還沒填：${missing.join('、')}`; return; }
  busy.value = true;
  const org = await call('post', '/api/twcore/organization', { orgCode: form.orgCode, reuse: true });
  const pra = org.success && await call('post', '/api/twcore/practitioner', { name: form.name, licenseNumber: form.licenseNumber, reuse: true });
  const role = pra?.success && await call('post', '/api/twcore/practitioner-role', { practitionerId: pra.id, organizationId: org.id });
  busy.value = false;
  const failed = !org.success ? ['醫療機構', org] : !pra.success ? ['醫師', pra] : !role.success ? ['醫師職務', role] : null;
  if (failed) { errorMsg.value = `${failed[0]}：${failed[1].error}`; issues.value = failed[1].issues || []; return; }
  orgId.value = org.id; doctor.id.value = pra.id; doctor.name.value = form.name;
  router.push('/doctor');
}
</script>

<template>
  <div class="page">
    <div class="panel">
      <h1>醫師端</h1>
      <p class="lead">選擇您的機構，填姓名與證書字號，按「進入」就能查看本機構病人的 AI 分流卡片。</p>
      <div class="field" :class="{ invalid: invalid.has('orgCode') }">
        <label for="orgCode">醫療機構</label>
        <select id="orgCode" v-model="form.orgCode">
          <option value="" disabled>請選擇</option>
          <option v-for="c in orgCodes" :key="c.code" :value="c.code">{{ c.display }}（{{ c.code }}）</option>
        </select>
      </div>
      <div class="grid">
        <div class="field" :class="{ invalid: invalid.has('name') }"><label for="name">姓名</label><input id="name" v-model.trim="form.name" autocomplete="off" /></div>
        <div class="field" :class="{ invalid: invalid.has('licenseNumber') }"><label for="license">證書字號</label><input id="license" v-model.trim="form.licenseNumber" autocomplete="off" @keyup.enter="login" /><small>例：醫字第012345號。同一字號要用同一個姓名</small></div>
      </div>
      <div class="actions">
        <button class="btn ghost" @click="fillExample" :disabled="busy">填入範例</button>
        <button class="btn" @click="login" :disabled="busy">{{ busy ? '確認中…' : '進入' }}</button>
      </div>
      <div v-if="errorMsg" class="alert error">
        {{ errorMsg }}
        <ul v-if="issues.length"><li v-for="(i, n) in issues" :key="n">{{ i.message }}</li></ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.field.invalid input, .field.invalid select { border-color: var(--bad); box-shadow: 0 0 0 4px rgba(255,59,48,.14); }
</style>
