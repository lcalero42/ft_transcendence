#!/bin/sh
set -e

. /tmp/load-secrets.sh

mkdir -p uploads/avatars
npx prisma migrate deploy
exec node dist/main
