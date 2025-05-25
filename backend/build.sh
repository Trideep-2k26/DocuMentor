#!/bin/bash
set -e
echo "Starting build process..."
cd frontend
npm install
npm run build
cd ..
cd backend
pip install --upgrade pip
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
cd ..
echo "Build completed successfully!"
