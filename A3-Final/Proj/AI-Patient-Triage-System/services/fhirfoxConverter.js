// services/fhirfoxConverter.js
// 聯測松 Track 1：把 FHIRfox「Simplified JSON」轉成 TW Core 1.0.0 FHIR Bundle。
// 規則與代碼對照表不寫在程式裡，全部讀 fhir/fhirfox/ 的官方 CSV（Apache-2.0，見該資料夾 README）；
// 轉換邏輯照官方 converter（generator/converter/src）改寫成 JS，額外做三件事：
//   1. 數值欄位轉成數字、對照表有 display 就寫上（官方標準答案都有）
//   2. 白帽：筆數上限、每個值只收字串／數字／布林且限長度、參照只能指向同一份資料裡的資源
//   3. 不丟例外：每筆的錯誤都收進 issues（位置寫「第幾筆 型別/id.欄位」），一次列出全部
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { FHIR_ID, clean } = require('./twcoreResources');

const DIR = path.join(__dirname, '..', 'fhir', 'fhirfox');
const IG = { name: 'tw.gov.mohw.twcore', version: '1.0.0' };
const LIMIT = { resources: 100, valueLength: 1000 };

// ---- 讀官方 CSV（欄位可能有引號與逗號）----
function parseCsv(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const split = (line) => {
        const out = []; let cur = ''; let quoted = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') { if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else quoted = !quoted; }
            else if (c === ',' && !quoted) { out.push(cur.trim()); cur = ''; }
            else cur += c;
        }
        return [...out, cur.trim()];
    };
    const head = split(lines[0] || '');
    return lines.slice(1).map(l => Object.fromEntries(split(l).map((v, i) => [head[i], v])));
}
const readCsv = (file) => parseCsv(fs.readFileSync(file, 'utf8'));
const groupBy = (rows, key) => rows.reduce((m, r) => m.set(r[key], [...(m.get(r[key]) || []), r]), new Map());
const active = (r) => r.is_active === 'true' && (!r.ig_name || (r.ig_name === IG.name && r.ig_version === IG.version));

const RULES = groupBy(readCsv(path.join(DIR, 'generator-rules', `${IG.name}.csv`)).filter(active)
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order)), 'resource_type');
const PROFILES = groupBy(readCsv(path.join(DIR, 'resource-profiles.csv')).filter(active), 'resource_type');
const CODES = new Map(fs.readdirSync(path.join(DIR, 'code-mappings')).filter(f => f.endsWith('.csv')).sort()
    .map(f => [path.basename(f, '.csv'), groupBy(readCsv(path.join(DIR, 'code-mappings', f)).filter(active), 'source_code')]));
const SOURCE_TYPES = [...RULES.keys()];

// 官方轉換器的舊欄位名（例如 birthday → birthDate）
const ALIAS = { idNumber: 'identityNumber', birthDate: 'birthday', subjectId: 'patientId', onsetDateTime: 'onsetDate', effectiveDateTime: 'effectiveDate',
    code: 'allergyCode', reactionManifestation: 'manifestation', reactionSeverity: 'severity', reactionExposureRoute: 'exposureRoute', reactionNote: 'note' };
const NUMBER_TYPES = ['decimal', 'integer', 'positiveInt', 'unsignedInt'];
const FHIR_TYPE = { allergyintolerance: 'AllergyIntolerance', careteam: 'CareTeam', diagnosticreport: 'DiagnosticReport', imagingstudy: 'ImagingStudy',
    medicationrequest: 'MedicationRequest', practitionerrole: 'PractitionerRole', relatedperson: 'RelatedPerson',
    'observation-laboratory-result': 'Observation', 'observation-vital-signs': 'Observation' };
const fhirType = (t) => FHIR_TYPE[t] || t.charAt(0).toUpperCase() + t.slice(1);

// 同一個 (型別, id) 永遠得到同一個 urn:uuid（UUID v5，跟官方標準答案一致）
function uuid5(name) {
    const ns = Buffer.from('6ba7b8119dad11d180b400c04fd430c8', 'hex'); // RFC 4122 URL namespace
    const h = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name, 'utf8')])).digest();
    h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80;
    const x = h.subarray(0, 16).toString('hex');
    return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
const fullUrlOf = (type, id) => `urn:uuid:${uuid5(`https://fhirfox.dev/${type}/${id}`)}`;

// ---- 寫入 FHIR path（只支援 CSV 用到的寫法：a.b[0].c、name[0]:official）----
function write(resource, fhirPath, value, mapping) {
    const segs = fhirPath.split('.').slice(1).map(s => {
        const m = /^([A-Za-z][A-Za-z0-9]*)(?:\[(\d+)\])?(?::([A-Za-z][A-Za-z0-9-]*))?$/.exec(s);
        if (!m) throw new Error(`不支援的 FHIR path ${fhirPath}`);
        return { name: m[1], index: m[2] === undefined ? undefined : Number(m[2]), slice: m[3] };
    });
    let cur = resource;
    segs.forEach((s, i) => {
        const leaf = i === segs.length - 1;
        if (s.index === undefined) {
            if (!leaf) { cur = cur[s.name] ??= {}; return; }
            if (mapping && s.name === 'code') {
                const prev = segs[i - 1]?.name || '';
                // Quantity／Duration 的 code 是 UCUM：display 寫進 unit（MedicationRequest 例外，照官方）；Quantity 沒有 display 欄位
                if (/(Quantity|Duration)$/.test(prev)) { if (resource.resourceType !== 'MedicationRequest') cur.unit = mapping.target_display || value; }
                else if (mapping.target_display) cur.display = mapping.target_display;
                cur.system = mapping.target_system;
            }
            cur[s.name] = value;
            return;
        }
        const arr = cur[s.name] ??= [];
        if (leaf) { arr[s.index] = value; return; }
        cur = arr[s.index] ??= {};
        if (s.slice) cur.use ??= s.slice;
    });
}
const readPath = (resource, fhirPath) => fhirPath.split('.').slice(1).reduce((cur, seg) => {
    const m = /^([A-Za-z][A-Za-z0-9]*)(?:\[(\d+)\])?$/.exec(seg);
    const v = m && cur ? cur[m[1]] : undefined;
    return m?.[2] === undefined ? v : Array.isArray(v) ? v[Number(m[2])] : undefined;
}, resource);

// 原始值檢查：只收字串／數字／布林（陣列只給參照用），字串去控制字元、限長度
function primitive(v, field) {
    if (typeof v === 'string') {
        if (v.length > LIMIT.valueLength) throw new Error(`${field} 超過 ${LIMIT.valueLength} 字`);
        return clean(v);
    }
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'boolean') return v;
    throw new Error(`${field} 只能是文字、數字或 true／false`);
}
function coerce(v, dataType, field) {
    if (dataType === 'boolean') {
        if (v === true || v === 'true') return true;
        if (v === false || v === 'false') return false;
        throw new Error(`${field} 要是 true 或 false`);
    }
    if (NUMBER_TYPES.includes(dataType)) {
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isFinite(n) || String(v).trim() === '') throw new Error(`${field} 要是數字`);
        return n;
    }
    return typeof v === 'number' ? String(v) : v;
}

// ---- 一筆原始資料 → 一筆 FHIR 資源；錯誤收進 errors，不中斷 ----
function convertOne(input, errors) {
    const type = String(input.resourceType).toLowerCase();
    const rules = RULES.get(type);
    const resource = { resourceType: rules[0].fhir_path.split('.')[0] };
    const used = new Set(['id', 'resourceType']);
    for (const rule of rules) {
        const field = rule.path.split('.')[1];
        const name = input[field] !== undefined ? field : ALIAS[field];
        const raw = name ? input[name] : undefined;
        if (name) used.add(name);
        try {
            if (raw === undefined || raw === null || raw === '') {
                if (rule.is_required === 'true') throw new Error(`${field} 必填`);
                continue;
            }
            // 官方特例：沒有診斷就不寫 diagnosis.use
            if (type === 'encounter' && field === 'diagnosisUse' && [undefined, null, ''].includes(input.conditionId)) continue;
            if (rule.transform_kind === 'constant') { write(resource, rule.fhir_path, rule.mapping_key); continue; }
            if (rule.transform_kind === 'build_reference') {
                const target = typeof input[`${field.replace(/Id$/, '')}Type`] === 'string' ? fhirType(input[`${field.replace(/Id$/, '')}Type`].toLowerCase()) : rule.reference_target;
                const ids = (Array.isArray(raw) ? raw : [raw]).map(x => String(primitive(x, field)));
                const bad = ids.find(x => !FHIR_ID.test(x));
                if (bad) throw new Error(`${field} 的 id「${bad}」格式不對（英數、連字號、句點）`);
                used.add(`${field.replace(/Id$/, '')}Type`);
                write(resource, rule.fhir_path, Array.isArray(raw) ? ids.map(x => `${target}/${x}`) : `${target}/${ids[0]}`);
                continue;
            }
            const value = coerce(primitive(raw, field), rule.data_type, field);
            if (rule.transform_kind === 'copy') { write(resource, rule.fhir_path, value); continue; }
            // code_map：院內碼 → 標準代碼；一個院內碼可以對到多個 coding
            const maps = CODES.get(rule.mapping_key)?.get(String(value));
            if (!maps?.length) throw new Error(`${field}「${value}」在代碼對照表 ${rule.mapping_key} 裡找不到`);
            maps.forEach((m, i) => {
                const p = i === 0 ? rule.fhir_path : rule.fhir_path.replace(/\.coding\[\d+\]\.code$/, `.coding[${i}].code`);
                write(resource, p, m.target_code, m);
            });
        } catch (e) {
            errors.push({ field, message: e.message });
        }
    }
    const profiles = PROFILES.get(type) || [];
    const profile = profiles.find(p => p.match_fhir_path && readPath(resource, p.match_fhir_path) === p.match_value) || profiles.find(p => !p.match_fhir_path);
    // 欄位順序：resourceType、meta、text 在前，方便對照
    const { resourceType, ...rest } = resource;
    return {
        resource: {
            resourceType,
            ...(profile ? { meta: { profile: [profile.profile_url] } } : {}),
            text: { status: 'generated', div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${resourceType}/${input.id}</p></div>` },
            ...rest
        },
        unused: Object.keys(input).filter(k => !used.has(k))
    };
}

// 把 Patient/1 這種參照改成同一份資料裡的 urn:uuid；找不到的收進 missing（不准指向伺服器上別人的資料）
function relink(value, index, missing) {
    if (Array.isArray(value)) return value.map(v => relink(v, index, missing));
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => {
        if (k !== 'reference' || typeof v !== 'string') return [k, relink(v, index, missing)];
        if (!index.has(v)) missing.push(v);
        return [k, index.get(v) || v];
    }));
}

// 資源裡所有 reference 字串
const references = (v) => Array.isArray(v) ? v.flatMap(references)
    : v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => (k === 'reference' && typeof x === 'string' ? [x] : references(x))) : [];

// ---- 主程式：整份 Simplified JSON → { bundle, entries, issues } ----
// 輸入可以是陣列，或 { resources: [...] }（FHIRfox 下載的格式）
function convert(body) {
    const list = Array.isArray(body) ? body : Array.isArray(body?.resources) ? body.resources : null;
    const issues = [];
    const err = (location, message, severity = 'error') => issues.push({ severity, location, message });
    if (!list) { err('', '要貼上 FHIRfox 的 Simplified JSON：一個陣列，或 { "resources": [...] }'); return { issues, entries: [] }; }
    if (!list.length) err('', '沒有任何資料');
    if (list.length > LIMIT.resources) { err('', `一次最多 ${LIMIT.resources} 筆，這份有 ${list.length} 筆`); return { issues, entries: [] }; }

    const seen = new Set();
    const converted = [];
    list.forEach((input, i) => {
        const type = String(input?.resourceType ?? '').toLowerCase();
        const where = `[${i}] ${type || '?'}/${input?.id ?? '?'}`;
        if (!input || typeof input !== 'object' || Array.isArray(input)) return err(`[${i}]`, '每一筆要是一個物件');
        if (!RULES.has(type)) return err(where, `resourceType 要是 ${SOURCE_TYPES.join('、')} 其中之一`);
        if (!FHIR_ID.test(String(input.id ?? ''))) return err(where, 'id 必填，只能用英數、連字號、句點');
        const key = `${fhirType(type)}/${input.id}`;
        if (seen.has(key)) return err(where, `${key} 重複出現`);
        seen.add(key);
        const errors = [];
        const { resource, unused } = convertOne(input, errors);
        errors.forEach(e => err(`${where}.${e.field}`, e.message));
        if (unused.length) err(where, `沒有用到的欄位：${unused.join('、')}`, 'information');
        converted.push({ index: i, sourceType: type, sourceId: String(input.id), resource, fullUrl: fullUrlOf(resource.resourceType, input.id) });
    });

    const index = new Map(converted.map(c => [`${c.resource.resourceType}/${c.sourceId}`, c.fullUrl]));
    const entries = converted.map(c => {
        const missing = [];
        const resource = relink(c.resource, index, missing);
        missing.forEach(m => err(`[${c.index}] ${c.sourceType}/${c.sourceId}`, `參照的 ${m} 不在這份資料裡（只能參照同一份資料裡的資源）`));
        return { ...c, resource };
    });
    // 跨病人參照：A 病人的資源不能指向屬於 B 病人的就醫、檢驗等（例如 Observation.subject＝A、encounter 卻是 B 的）
    const byUrl = new Map(entries.map(e => [e.fullUrl, e]));
    const ownerOf = (e) => e.resource.resourceType === 'Patient' ? e.fullUrl : (e.resource.subject || e.resource.patient)?.reference;
    for (const e of entries) {
        const owner = ownerOf(e);
        if (!owner || e.resource.resourceType === 'Patient') continue;
        for (const ref of references(e.resource)) {
            const target = byUrl.get(ref);
            const other = target && ownerOf(target);
            if (other && other !== owner) err(`[${e.index}] ${e.sourceType}/${e.sourceId}`, `參照的 ${target.resource.resourceType}/${target.sourceId} 屬於另一位病人`);
        }
    }
    const bundle = { resourceType: 'Bundle', type: 'collection', entry: entries.map(e => ({ fullUrl: e.fullUrl, resource: e.resource })) };
    return { bundle, entries, issues };
}

// 上傳用：collection → transaction。一律 POST（不接受 PUT、不帶 id），
// 機構、醫事人員、病人帶 If-None-Exist：伺服器上已有同一個識別碼就沿用，不會重複也不會覆蓋
const DEDUPE = { Organization: true, Practitioner: true, Patient: true };
const escapeToken = (v) => String(v).replace(/[\\|,$]/g, '\\$&');
function toTransaction(bundle) {
    return {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: bundle.entry.map(({ fullUrl, resource }) => {
            // 病人用身分證（第 2 個 identifier）判斷同一人，其他用第一個 identifier
            const id = resource.resourceType === 'Patient' ? resource.identifier?.find(i => i.system === 'http://www.moi.gov.tw') : resource.identifier?.[0];
            const ifNoneExist = DEDUPE[resource.resourceType] && id?.system && id?.value
                ? `identifier=${encodeURIComponent(`${id.system}|${escapeToken(id.value)}`)}` : undefined;
            return { fullUrl, resource, request: { method: 'POST', url: resource.resourceType, ...(ifNoneExist ? { ifNoneExist } : {}) } };
        })
    };
}

module.exports = { convert, toTransaction, LIMIT, SOURCE_TYPES, fullUrlOf };
