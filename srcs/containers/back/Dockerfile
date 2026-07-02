FROM node:22-alpine

WORKDIR /app

COPY --chmod=755 ./conf/entrypoint.sh /tmp/entrypoint.sh

# CMD ["tail", "-f", "/dev/null"]
ENTRYPOINT ["/tmp/entrypoint.sh"]
