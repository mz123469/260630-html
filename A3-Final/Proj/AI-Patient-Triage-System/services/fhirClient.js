// services/fhirClient.js
// 所有對 FHIR Server 的請求都走這裡：統一 base URL、FHIR JSON header，
// 並把每一次的 Request / Response（含 HTTP header 與 JSON body）記到 logs/fhir-exchange.jsonl。
// 聯測（C 聯測模擬第 5 頁）要求「截取完整 Request 與 Response Log」當互通證據，這份檔案就是證據來源。
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('../config');

const FHIR_BASE_URL = (process.env.FHIR_BASE_URL || 'https://twcore.hapi.fhir.tw/fhir').replace(/\/+$/, '');
const LOG_FILE = path.join(__dirname, '..', 'logs', 'fhir-exchange.jsonl');

const fhirClient = axios.create({
    baseURL: FHIR_BASE_URL,
    timeout: 20000,
    maxRedirects: 0, // FHIR Server 不該轉址；不跟著跳，才不會被導去別台（白帽測試：302 到別的主機）
    headers: {
        // FHIR R4 規定的 JSON MIME type（http://hl7.org/fhir/R4/http.html#mime-type）
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json',
        'Prefer': 'return=representation' // 建立／更新後把資源回傳（http.html#ops），我們要用它核對型別與 id
    }
});

// Authorization 之類的憑證不寫進證據檔
function safeHeaders(headers) {
    const out = {};
    for (const [k, v] of Object.entries(headers || {})) {
        if (typeof v === 'function' || (v && typeof v === 'object')) continue;
        out[k] = /authorization|cookie/i.test(k) ? '[REDACTED]' : v;
    }
    return out;
}

function writeEvidence(entry) {
    try {
        fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
        fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
    } catch (e) {
        console.error('[證據紀錄] 寫入失敗:', e.message);
    }
}

// 終端機上一行看一次請求：方法、路徑、狀態碼、資源 id。
// 查詢參數的值一律遮掉（例如 identifier=…|A123456789 會帶出身分證），完整內容只留在證據檔。
function consoleLine(config, response, error) {
    const url = new URL(axios.getUri(config || {}));
    const query = [...url.searchParams.keys()].map(k => `${k}=…`).join('&');
    const where = url.pathname.replace(new URL(FHIR_BASE_URL).pathname, '') + (query ? `?${query}` : '');
    const status = response?.status ?? `失敗（${error?.code || error?.message}）`;
    const body = response?.data;
    const id = body?.resourceType && body.id ? ` → ${body.resourceType}/${body.id}` : body?.resourceType === 'Bundle' ? ` → ${body.total ?? body.entry?.length ?? 0} 筆` : '';
    console.log(`[FHIR] ${(config?.method || '').toUpperCase()} ${where} ${status}${id}`);
}

function record(config, response, error) {
    consoleLine(config, response, error);
    writeEvidence({
        time: new Date().toISOString(),
        request: {
            method: (config?.method || '').toUpperCase(),
            url: axios.getUri(config || {}),
            headers: safeHeaders(config?.headers),
            body: config?.data ? safeParse(config.data) : undefined
        },
        response: response ? {
            status: response.status,
            headers: safeHeaders(response.headers),
            body: response.data
        } : undefined,
        error: error ? error.message : undefined
    });
}

function safeParse(data) {
    if (typeof data !== 'string') return data;
    try { return JSON.parse(data); } catch (e) { return data; }
}

fhirClient.interceptors.response.use(
    (response) => { record(response.config, response); return response; },
    (error) => { record(error.config, error.response, error); return Promise.reject(error); }
);
require('./oauth').attach(fhirClient); // 聯測主機要 Bearer token（.env 有設 OAUTH_* 才啟用）

// 把 FHIR Server 回的 OperationOutcome 整理成看得懂的一行一行（Error / Warning / Information）
function summarizeOutcome(data) {
    if (!data || data.resourceType !== 'OperationOutcome') return [];
    return (data.issue || []).map(i => ({
        severity: i.severity,
        code: i.code,
        location: (i.expression || i.location || []).join(', '),
        message: i.diagnostics || i.details?.text || ''
    }));
}

// token 查詢值：FHIR 搜尋規定值裡的 \ | , $ 要用反斜線跳脫（http://hl7.org/fhir/R4/search.html#escaping），
// 否則「醫字第|01號」會被當成 system|value 拆開、逗號會變成 OR（白帽測試 F1–F3）
const token = (system, value) => `${system}|${String(value).replace(/[\\|,$]/g, '\\$&')}`;

// 用 identifier 找有沒有同一筆資源（重複建立前先確認）。
// Cache-Control: no-cache：HAPI 會快取 60 秒內相同的查詢，不加的話剛建好的資料會查不到。
// 只拿 search.mode=match 的那一筆：HAPI 有警告時會在 entry 裡多塞一個 OperationOutcome（mode=outcome）
async function findByIdentifier(type, system, value) {
    const r = await fhirClient.get(`/${type}`, {
        params: { identifier: token(system, value), _count: 1 },
        headers: { 'Cache-Control': 'no-cache' }
    });
    return (r.data?.entry || []).map(e => e?.resource).find(x => x?.resourceType === type) || null;
}

module.exports = { fhirClient, FHIR_BASE_URL, summarizeOutcome, findByIdentifier, token, LOG_FILE };
