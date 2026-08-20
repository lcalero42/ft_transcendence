#!/bin/sh
set -e

DB_USER=$(cat /run/secrets/db_user)
DB_PASSWORD=$(cat /run/secrets/db_password)
DB_NAME=$(cat /run/secrets/db_name)
JWT_SECRET=$(cat /run/secrets/jwt_secret)
INTERNAL_API_KEY=$(cat /run/secrets/internal_api_key)

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public"

{
  echo "DATABASE_URL=${DATABASE_URL}"
  echo "JWT_SECRET=${JWT_SECRET}"
  echo "JWT_EXPIRES_IN=1d"
  echo "INTERNAL_API_KEY=${INTERNAL_API_KEY}"
} > /app/.env

npm ci
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npx prisma studio --browser none &
npm run start:dev

# while :; do
#     sleep infinity
# done
