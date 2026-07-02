FROM node:22-alpine

WORKDIR /app

COPY --chmod=755 ./conf/entrypoint.sh /tmp/entrypoint.sh

EXPOSE 3000

# CMD ["tail", "-f", "/dev/null"]
ENTRYPOINT ["/tmp/entrypoint.sh"]
