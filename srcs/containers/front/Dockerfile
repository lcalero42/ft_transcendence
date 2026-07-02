FROM node:22-alpine

WORKDIR /app

COPY --chmod=755 ./conf/entrypoint.sh /tmp/entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["/tmp/entrypoint.sh"]