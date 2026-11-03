// services/oauth.js：OAuth 2.0 Client Credentials（RFC 6749 §4.4；A3-2 的授權流程、聯測松 Level I 規定）
// 聯測主機前面有 Token Gateway：要先向大會 Keycloak 換 access token，每個 FHIR 請求帶 Bearer。
// .env 沒設 OAUTH_TOKEN_URL 就整段不啟用（本機 mock 與公開測試伺服器不用 token）。
const axios = require('axios');
require('../config');

const { OAUTH_TOKEN_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET = 'secret', OAUTH_SCOPE = 'twcore' } = process.env;
const enabled = Boolean(OAUTH_TOKEN_URL && OAUTH_CLIENT_ID);
let cached = { token: '', expiresAt: 0 };

// 到期前 30 秒就換新的；client_secret 用 HTTP Basic 送（IUA 規定），token 本身絕不印出來
async function getToken() {
    if (cached.expiresAt > Date.now() + 30_000) return cached.token;
    const r = await axios.post(OAUTH_TOKEN_URL, new URLSearchParams({ grant_type: 'client_credentials', scope: OAUTH_SCOPE }), {
        auth: { username: OAUTH_CLIENT_ID, password: OAUTH_CLIENT_SECRET }, timeout: 10000
    });
    if (typeof r.data?.access_token !== 'string') throw new Error('授權伺服器沒有回 access_token');
    cached = { token: r.data.access_token, expiresAt: Date.now() + (Number(r.data.expires_in) || 300) * 1000 };
    console.log(`[OAuth] 取得 token（scope ${OAUTH_SCOPE}，${Number(r.data.expires_in) || 300} 秒後到期）`);
    return cached.token;
}

// 掛到 axios instance：送出前加 Authorization；拿到 401 就清掉快取重試一次
function attach(client) {
    if (!enabled) return;
    client.interceptors.request.use(async (config) => {
        if (!config.headers.Authorization) config.headers.Authorization = `Bearer ${await getToken()}`;
        return config;
    });
    client.interceptors.response.use(undefined, async (error) => {
        if (error.response?.status === 401 && !error.config._retried) {
            cached = { token: '', expiresAt: 0 };
            return client({ ...error.config, _retried: true, headers: { ...error.config.headers, Authorization: undefined } });
        }
        throw error;
    });
}

module.exports = { attach, enabled };
