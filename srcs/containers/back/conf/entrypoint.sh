#!/bin/sh
set -e

. /tmp/load-secrets.sh

{
  echo "DATABASE_URL=${DATABASE_URL}"
  echo "JWT_SECRET=${JWT_SECRET}"
  echo "JWT_EXPIRES_IN=${JWT_EXPIRES_IN}"
  echo "JWT_REMEMBER_EXPIRES_IN=${JWT_REMEMBER_EXPIRES_IN}"
  echo "INTERNAL_API_KEY=${INTERNAL_API_KEY}"
} > /app/.env

mkdir -p uploads/avatars
npm ci
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npx prisma studio --browser none &
npm run start:dev
