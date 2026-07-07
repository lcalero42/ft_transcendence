#!/bin/sh
set -e

DB_USER=$(cat /run/secrets/db_user)
DB_PASSWORD=$(cat /run/secrets/db_password)
DB_NAME=$(cat /run/secrets/db_name)

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public"
echo "DATABASE_URL=${DATABASE_URL}" > /app/.env

npm ci
npx prisma migrate deploy
npx prisma generate
npx prisma studio --browser none &
npm run start

# while :; do
#     sleep infinity
# done
