#!/bin/sh
set -e

ENV_FILE=.env.development.local

cat > "$ENV_FILE" <<ENV
EXPO_PUBLIC_APP_ENV=qa
EXPO_PUBLIC_API_URL=https://d37hwu5fijm6v5.cloudfront.net
ENV

trap 'rm -f "$ENV_FILE"' EXIT INT TERM

npx expo start --dev-client -c "$@"
