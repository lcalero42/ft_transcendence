#!/bin/sh
set -e

#install package.json dependencies (colyseus)
npm ci

#launch nodeJs server :3000
npm run dev