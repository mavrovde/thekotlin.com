#!/bin/bash
set -e

echo "🔒 Generating local SSL certificates for Nginx proxy..."
mkdir -p ssl
if [ ! -f ssl/cert.pem ]; then
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -sha256 -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

# Default to the tag the workflow publishes as "latest"; override with IMAGE_TAG=x.y.z.
# (This used to hardcode 0.1.1, which no longer exists in the registry.)
IMAGE_TAG="${IMAGE_TAG:-latest}"
echo "🚀 Bringing up the production Docker Compose stack (IMAGE_TAG=$IMAGE_TAG)..."
IMAGE_TAG="$IMAGE_TAG" docker compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 15

echo "🧪 Running Production Smoke Tests..."
cd frontend
PROD_SMOKE=1 npx playwright test --project=prod-smoke

echo "🧹 Cleaning up..."
cd ..
docker compose -f docker-compose.prod.yml down

echo "✅ Smoke tests passed successfully!"
