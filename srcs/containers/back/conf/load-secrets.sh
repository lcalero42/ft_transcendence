DB_USER=$(cat /run/secrets/db_user)
DB_PASSWORD=$(cat /run/secrets/db_password)
DB_NAME=$(cat /run/secrets/db_name)
JWT_SECRET=$(cat /run/secrets/jwt_secret)
INTERNAL_API_KEY=$(cat /run/secrets/internal_api_key)
ADMINS=$(cat /run/secrets/admins)
GOOGLE_CLIENT_ID=$(cat /run/secrets/google_client_id)
GOOGLE_CLIENT_SECRET=$(cat /run/secrets/google_client_secret)
DISCORD_CLIENT_ID=$(cat /run/secrets/discord_client_id)
DISCORD_CLIENT_SECRET=$(cat /run/secrets/discord_client_secret)
JWT_EXPIRES_IN=1d
JWT_REMEMBER_EXPIRES_IN=30d
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public"

export DATABASE_URL JWT_SECRET JWT_EXPIRES_IN JWT_REMEMBER_EXPIRES_IN INTERNAL_API_KEY ADMINS
export GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET DISCORD_CLIENT_ID DISCORD_CLIENT_SECRET
