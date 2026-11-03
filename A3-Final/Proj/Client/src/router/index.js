// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import PatientView from '../views/PatientView.vue'
import DoctorView from '../views/DoctorView.vue'
import SetupView from '../views/SetupView.vue'
import PatientSelfView from '../views/PatientSelfView.vue'
import DoctorLoginView from '../views/DoctorLoginView.vue'
import ImportView from '../views/ImportView.vue'

const routes = [
  // 一般使用模式：病人端 → 醫師端（登入）→ 醫師查看
  { path: '/patient', name: 'PatientSelf', component: PatientSelfView },
  { path: '/login', name: 'DoctorLogin', component: DoctorLoginView },
  { path: '/doctor', name: 'Doctor', component: DoctorView },        // 兩種模式共用
  // 聯測順序：① 建立資料 → ② 病人回報 → ③ 醫師查看；④ 匯入聯測 JSON（Track 1 轉換能力）
  { path: '/setup', name: 'Setup', component: SetupView },            // TW Core 基礎資源（聯測用）
  { path: '/import', name: 'Import', component: ImportView },        // 聯測松 Track 1：匯入 FHIRfox Simplified JSON
  { path: '/', name: 'Patient', component: PatientView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
