// server.js：後端入口。只做三件事：安全設定、掛路由、統一錯誤格式。
require('./config');
const express = require('express');
const cors = require('cors');
const { FHIR_BASE_URL } = require('./services/fhirClient');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1'; // 只聽本機，同網段的人連不進來；要給別台測再改 0.0.0.0

// 只允許自己的前端與 CDS Hooks Sandbox 跨網域呼叫（白帽測試 E1：原本是 *，任何網站都能叫）
const ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,https://sandbox.cds-hooks.org').split(',').map(s => s.trim());

app.disable('x-powered-by');                     // 不告訴別人用什麼框架
app.use((req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); next(); });
app.use(cors({ origin: ORIGINS }));
// 聯測匯入一次最多 100 筆，給 1 MB；要放在共用的 100 KB 前面（先解析的那個生效）
app.use('/api/fhirfox', express.json({ type: ['application/json', 'application/fhir+json'], limit: '1mb' }));
app.use(express.json({ type: ['application/json', 'application/fhir+json'], limit: '100kb' }));

app.use('/api/triage', require('./routes/triage'));     // 病人自述 → AI → Observation
app.use('/api/twcore', require('./routes/twcore'));     // TW Core 基礎資源（聯測用）
app.use('/cds-services', require('./routes/cds-hooks')); // 標準 CDS Hooks
app.use('/api/fhirfox', require('./routes/fhirfox'));   // 聯測匯入 FHIRfox Simplified JSON → TW Core Bundle

// 找不到路由、JSON 壞掉、body 太大、程式例外：一律回 JSON，不把堆疊（stack trace）漏給呼叫端（白帽測試 A1、E2、E4）
app.use((req, res) => res.status(404).json({ success: false, error: '找不到這個網址' }));
app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error('[錯誤]', err);
    const error = err.type === 'entity.too.large' ? '資料太大'
        : err.type === 'entity.parse.failed' ? 'JSON 格式錯誤'
        : status >= 500 ? '伺服器內部錯誤' : err.message;
    res.status(status).json({ success: false, error });
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`FHIR Server: ${FHIR_BASE_URL}`);
});
