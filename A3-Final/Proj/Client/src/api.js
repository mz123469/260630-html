// src/api.js：前端呼叫後端的唯一入口。後端位址只寫在這裡。
import axios from 'axios';

export const API_BASE = 'http://localhost:3000';

// 回傳後端的 JSON；連不到後端時也回同樣格式，畫面只要處理一種情況
export async function call(method, path, data) {
  try {
    return (await axios({ method, url: API_BASE + path, data })).data;
  } catch (err) {
    return err.response?.data || { success: false, error: '連不到後端，請確認終端機的 node server.js 有在跑' };
  }
}
