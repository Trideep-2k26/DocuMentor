#!/bin/bash

# Exit on any error
set -e

# Log each step for debugging
echo "Starting build process..."

# Install frontend (React) dependencies and build the frontend
echo "Building React frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend (Django) dependencies
echo "Installing Django backend dependencies..."
cd backend
pip install --upgrade pip  # Ensure pip is up to date to improve dependency resolution
pip install -r requirements.txt

# Run database migrations to create tables like api_document
echo "Running database migrations..."
python manage.py migrate

# Collect static files for Django (assumes React build output is used as static files)
echo "Collecting static files for Django..."
python manage.py collectstatic --noinput
cd ..

echo "Build completed successfully!"
