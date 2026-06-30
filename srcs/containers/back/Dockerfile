FROM node:20-alpine

WORKDIR /app

COPY conf/package*.json ./

RUN npm install

RUN npx prisma generate

CMD ["npm", "run", "start:dev"]
