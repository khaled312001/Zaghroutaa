#!/bin/bash
# نشر أحدث كود زُغْرُوطَة على السيرفر (بناء + تبديل ذرّي مع باك أب)
set -e
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
APP="$HOME/domains/zaghroutaa.com/nodejs"
TS=$(date +%s)

echo "[1/6] node: $(node -v) | npm: $(npm -v)"

echo "[2/6] clone latest from GitHub"
cd "$HOME"
rm -rf zaghroutaa-new
git clone --depth 1 https://github.com/khaled312001/Zaghroutaa.git zaghroutaa-new
cd zaghroutaa-new

echo "[3/6] copy env from running app"
cp "$APP/.env" .env 2>/dev/null || echo "no existing .env"

echo "[4/6] npm install"
npm install --no-audit --no-fund --loglevel=error

echo "[5/6] build"
npm run build

echo "[6/6] atomic swap into nodejs/"
cp "$APP/.env" "/tmp/zg.env.$TS" 2>/dev/null || true
mv "$APP" "$HOME/domains/zaghroutaa.com/nodejs_old_$TS"
mv "$HOME/zaghroutaa-new" "$APP"
cp "/tmp/zg.env.$TS" "$APP/.env" 2>/dev/null || true
mkdir -p "$APP/tmp"

# uploads ثابتة بتفضل بعد كل نشر (symlink لمجلد دائم بره التطبيق)
PERSIST="$HOME/domains/zaghroutaa.com/persist-uploads"
mkdir -p "$PERSIST"
rm -rf "$APP/public/uploads"
ln -s "$PERSIST" "$APP/public/uploads"

touch "$APP/tmp/restart.txt"

# نظافة: سيب آخر باك أب واحد بس
ls -dt "$HOME"/domains/zaghroutaa.com/nodejs_old_* 2>/dev/null | tail -n +2 | xargs -r rm -rf

echo "DEPLOY_DONE TS=$TS"
