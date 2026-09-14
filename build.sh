#!/usr/bin/env bash
set -o errexit

echo "════════════════════════════════════════"
echo "  ShopFront Build — $(date)"
echo "════════════════════════════════════════"

echo ""
echo "▶ [1/6] Installing Python dependencies..."
pip install --upgrade pip
pip install -r django/requirements.txt

echo ""
echo "▶ [2/6] Installing Node dependencies..."
cd react
npm install
cd ..

echo ""
echo "▶ [3/6] Building React app..."
cd react
npm run build
cd ..

echo ""
echo "▶ [4/6] Copying React build into Django..."
rm -rf django/frontend_dist
mkdir -p django/frontend_dist
cp -r react/dist/. django/frontend_dist/

echo ""
echo "▶ [5/6] Collecting Django static files..."
cd django
python manage.py collectstatic --no-input --clear

echo ""
echo "▶ [6/6] Running migrations..."
python manage.py migrate

if [ "$CREATE_SUPERUSER" = "true" ]; then
  echo ""
  echo "▶ Creating superuser (if not exists)..."
  python manage.py createsuperuser --noinput || echo "Superuser already exists, skipping."
fi

echo ""
echo "════════════════════════════════════════"
echo "  ✅ Build complete"
echo "════════════════════════════════════════"