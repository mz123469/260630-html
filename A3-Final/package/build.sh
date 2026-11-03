#!/usr/bin/env bash
# 重打測試包：Proj/（已提交的版本，不含 .env、node_modules）＋ README、測試指南 ＋ screenshots/app → 截圖/
set -e
cd "$(dirname "$0")/.."
NAME=AI分流系統-測試包
OUT="$PWD/package/$NAME.zip"
TMP=$(mktemp -d)
git archive --format=tar --prefix="$NAME/" HEAD:Proj | tar -x -C "$TMP"
cp package/README.md package/測試指南.md "$TMP/$NAME/"
cp -R screenshots/app "$TMP/$NAME/截圖"
rm -f "$OUT"
# 用 Python zipfile 打包：中文檔名會帶 UTF-8 旗標（Windows 解壓才不會亂碼），start-mac.command 保留可執行權限
(cd "$TMP" && python3 -I - "$OUT" "$NAME" <<'PY'
import os, sys, zipfile
out, root = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, _, files in os.walk(root):
        for f in sorted(files):
            if f != '.DS_Store':
                z.write(os.path.join(d, f))
PY
)
rm -rf "$TMP"
echo "已產生 $OUT"
