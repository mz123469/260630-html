// Demo：把情緒分析的 Prompt 改成「用藥副作用分流」，跑 3 個測試案例（含一個反話／壓抑的刁鑽案例）。
// 執行：GEMINI_API_KEY 放在 .env 或環境變數，node cases.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeMedicationFeedback(patientText) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: { responseMimeType: 'application/json' }
  });

  // 跟範例的差別：角色換成「藥師」、情境換成「用藥副作用分流」、欄位多了 medication 與 side_effects。
  // urgency_score、needs_human_intervention、summary 三個欄位名稱刻意跟範例一樣，
  // 這樣 fhirService.js 存 Observation 的程式一行都不用改。
  const prompt = `
    你是一位醫院的臨床藥師，負責用藥安全分流。
    請分析以下病人對「用藥後狀況」的自述，並回傳嚴格的 JSON 格式。
    注意：病人常常會淡化症狀或說反話（例如「沒事啦」），請依症狀本身判斷，不要被語氣帶走。

    需分析欄位：
    1. "emotion": 核心情緒 (字串)。
    2. "medication": 病人提到的藥物或藥物類別，沒提到就回傳 "未提及" (字串)。
    3. "side_effects": 疑似副作用的症狀 (字串陣列，沒有就空陣列)。
    4. "urgency_score": 急迫性分數 (1-10，數字；呼吸困難、胸痛、昏倒、嚴重過敏至少 8 分)。
    5. "needs_human_intervention": 是否需要藥師或醫師今天就聯絡病人 (布林值)。
    6. "summary": 給藥師的一句話摘要 (字串)。

    病人自述： "${patientText}"
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// 三個測試案例：高風險、低風險、反話／壓抑
const cases = [
  { name: '案例 1（高風險，想自行停藥）', text: '降血壓的藥吃了兩個禮拜，一直乾咳，晚上咳到睡不著，我想先自己停藥看看會不會好。' },
  { name: '案例 2（低風險，單純詢問）', text: '新開的止痛藥吃了胃有一點不舒服，還可以忍，想問是不是要飯後吃比較好？' },
  { name: '案例 3（反話／壓抑）', text: '沒事啦，藥我都有照吃，就是這幾天爬樓梯常常喘不過氣，大概是天氣太熱，不用麻煩醫生。' },
];

(async () => {
  for (const c of cases) {
    console.log(`\n=== ${c.name}`);
    console.log(`病人自述：${c.text}`);
    try {
      const r = await analyzeMedicationFeedback(c.text);
      console.log(JSON.stringify(r, null, 2));
    } catch (e) {
      console.error('AI 分析失敗：', e.message);
    }
  }
})();
