DB_USER=$(cat /run/secrets/db_user)
DB_PASSWORD=$(cat /run/secrets/db_password)
DB_NAME=$(cat /run/secrets/db_name)
JWT_SECRET=$(cat /run/secrets/jwt_secret)
INTERNAL_API_KEY=$(cat /run/secrets/internal_api_key)
ADMIN_EMAIL=$(cat /run/secrets/admin_email)
ADMIN_PASSWORD=$(cat /run/secrets/admin_password)
JWT_EXPIRES_IN=1d
JWT_REMEMBER_EXPIRES_IN=30d
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public"

export DATABASE_URL JWT_SECRET JWT_EXPIRES_IN JWT_REMEMBER_EXPIRES_IN INTERNAL_API_KEY ADMIN_EMAIL ADMIN_PASSWORD
