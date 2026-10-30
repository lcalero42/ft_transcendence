FROM node:22-alpine AS front-build

WORKDIR /app

COPY ./front/front_data/package.json ./front/front_data/package-lock.json ./
RUN npm ci

COPY ./front/front_data/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npx vite build

FROM nginx:1.27-alpine AS base

RUN apk add --no-cache openssl curl

COPY --chmod=755 ./nginx/conf/generate-cert.sh /docker-entrypoint.d/05-generate-cert.sh
COPY ./nginx/conf/upgrade-map.conf /etc/nginx/conf.d/upgrade-map.conf
COPY ./nginx/conf/app.conf /etc/nginx/snippets/app.conf
COPY ./nginx/conf/security-headers.conf /etc/nginx/snippets/security-headers.conf

EXPOSE 80 443

FROM base AS dev

COPY ./nginx/conf/dev.conf.template /etc/nginx/templates/default.conf.template

FROM base AS prod

COPY ./nginx/conf/prod.conf.template /etc/nginx/templates/default.conf.template
RUN rm -rf /usr/share/nginx/html/*
COPY --from=front-build /app/dist /usr/share/nginx/html
