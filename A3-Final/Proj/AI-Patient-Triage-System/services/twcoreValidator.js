// services/twcoreValidator.js
// 上傳前的把關：用 HL7 官方 validator_cli 照 TW Core 1.0.0 驗整份 Bundle。
// 不用伺服器的 $validate：twcore.hapi.fhir.tw 跑的是 TW Core 0.3.x（D4），而且解析不了 Bundle 內的 urn:uuid 參照，
// 對合格的 1.0.0 資料也會報 Error（實測 5 個），拿它當門檻會永遠上傳不了。
// validator_cli.jar 由 tools/validate.sh 第一次執行時下載；Java 用 JAVA_HOME，沒有就用 PATH 上的 java。
// 一次只跑一個（每次約 12 秒、2 GB 記憶體），逾時 120 秒。
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const JAR = process.env.VALIDATOR_JAR || path.join(__dirname, '..', '..', 'tools', 'validator_cli.jar');
const JAVA = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'java') : 'java';
const IG = 'tw.gov.mohw.twcore#1.0.0';

let queue = Promise.resolve(); // 排隊：前一個驗完才跑下一個

// 回 { available: false, reason } 或 { available: true, issues: [{ severity, location, message }] }
function validateBundle(bundle) {
    const run = queue.then(() => runOnce(bundle));
    queue = run.catch(() => {});
    return run;
}

async function runOnce(bundle) {
    if (!fs.existsSync(JAR)) return { available: false, reason: '找不到 tools/validator_cli.jar（先執行一次 tools/validate.sh 下載）' };
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'twcore-validate-'));
    const input = path.join(dir, 'bundle.json');
    const output = path.join(dir, 'outcome.json');
    try {
        fs.writeFileSync(input, JSON.stringify(bundle));
        const args = ['-Dfile.encoding=UTF-8', '-jar', JAR, input, '-version', '4.0.1', '-ig', IG, '-output', output];
        await new Promise((resolve, reject) => {
            // execFile 不經過 shell，路徑與參數不會被當成指令
            execFile(JAVA, args, { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }, (e) => {
                // validator 有 Error 時結束碼是 1，但 outcome.json 照樣產生，所以只看檔案有沒有出來
                if (fs.existsSync(output)) return resolve();
                reject(e?.code === 'ENOENT' ? new Error('找不到 Java（請安裝 Java 17，或在 .env 設 JAVA_HOME）') : e || new Error('validator 沒有產生結果'));
            });
        });
        const outcome = JSON.parse(fs.readFileSync(output, 'utf8'));
        return {
            available: true,
            issues: (outcome.issue || []).map(i => ({
                severity: i.severity,
                location: (i.expression || i.location || [])[0] || '',
                message: i.details?.text || i.diagnostics || ''
            }))
        };
    } catch (e) {
        return { available: false, reason: e.message };
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

module.exports = { validateBundle, IG };
