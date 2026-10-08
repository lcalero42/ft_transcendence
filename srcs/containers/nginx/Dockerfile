FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY --chmod=755 ./conf/generate-cert.sh /docker-entrypoint.d/05-generate-cert.sh
COPY ./conf/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80 443
