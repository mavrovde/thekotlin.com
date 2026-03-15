#!/bin/bash
set -e

echo "🔒 Generating local SSL certificates for Nginx proxy..."
mkdir -p ssl
if [ ! -f ssl/cert.pem ]; then
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -sha256 -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

echo "🚀 Bringing up the production Docker Compose stack (v0.1.1)..."
IMAGE_TAG=0.1.1 docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 15

echo "🧪 Running Production Smoke Tests..."
cd frontend
npx playwright test e2e/prod-smoke.spec.ts

echo "🧹 Cleaning up..."
cd ..
docker-compose -f docker-compose.prod.yml down

echo "✅ Smoke tests passed successfully!"
