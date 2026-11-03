// config.js：讀 .env。用絕對路徑，從哪個資料夾執行 node 都讀得到（白帽測試：在上一層執行時 .env 沒被讀到，金鑰和 FHIR 位址全是空的）
require('dotenv').config({ path: require('path').join(__dirname, '.env'), quiet: true });
