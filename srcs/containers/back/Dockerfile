FROM node:22-alpine AS base

WORKDIR /app

FROM base AS dev

COPY --chmod=755 ./conf/load-secrets.sh /tmp/load-secrets.sh
COPY --chmod=755 ./conf/entrypoint.sh /tmp/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/tmp/entrypoint.sh"]

FROM base AS build

COPY ./project_volume/package.json ./project_volume/package-lock.json ./
RUN npm ci

COPY ./project_volume/ ./
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate \
    && npm run build

FROM base AS prod

ENV NODE_ENV=production

COPY ./project_volume/package.json ./project_volume/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY ./project_volume/prisma ./prisma
COPY ./project_volume/prisma.config.ts ./
COPY --chmod=755 ./conf/load-secrets.sh /tmp/load-secrets.sh
COPY --chmod=755 ./conf/entrypoint.prod.sh /tmp/entrypoint.sh

EXPOSE 3000 2567

ENTRYPOINT ["/tmp/entrypoint.sh"]
