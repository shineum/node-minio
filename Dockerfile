#Author: Sungwon Um
FROM node:lts-alpine3.15

WORKDIR /opt/app

COPY public public
COPY src src
COPY app.js .
COPY minioHandler.js .
COPY package-lock.json .
COPY package.json .

RUN npm install
RUN npm run-script build

EXPOSE 3000

ENTRYPOINT ["node", "app"]