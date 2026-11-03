// services/rateLimit.js：簡單限流。每個來源 IP 在 windowMs 內最多 max 次，超過回 429。
// 不用外部套件；每個時間窗清一次過期的 IP，記憶體不會一直長（白帽第三輪：限流表只加不刪）。
module.exports = function rateLimit({ windowMs = 60_000, max = 10, message = '送出太頻繁，請一分鐘後再試' } = {}) {
    const hits = new Map(); // ip → 這段時間內的時間戳
    const sweep = setInterval(() => {
        const now = Date.now();
        for (const [ip, ts] of hits) {
            const live = ts.filter(t => now - t < windowMs);
            live.length ? hits.set(ip, live) : hits.delete(ip);
        }
    }, windowMs);
    sweep.unref(); // 計時器不阻止程式結束

    return (req, res, next) => {
        const now = Date.now();
        const recent = (hits.get(req.ip) || []).filter(t => now - t < windowMs);
        recent.push(now);
        hits.set(req.ip, recent);
        if (recent.length > max) return res.status(429).json({ success: false, error: message });
        next();
    };
};
