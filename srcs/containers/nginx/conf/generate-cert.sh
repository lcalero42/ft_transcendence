#!/bin/sh
set -e

CERT_DIR=/etc/nginx/certs
CERT_FILE="$CERT_DIR/transcendence.crt"
KEY_FILE="$CERT_DIR/transcendence.key"

if [ -s "$CERT_FILE" ] && [ -s "$KEY_FILE" ] \
    && openssl x509 -checkend 86400 -noout -in "$CERT_FILE" >/dev/null; then
    echo "generate-cert: valid certificate found, skipping"
    exit 0
fi

mkdir -p "$CERT_DIR"
openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout "$KEY_FILE" -out "$CERT_FILE" \
    -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
chmod 600 "$KEY_FILE"
echo "generate-cert: self-signed certificate created"
