FROM node:carbon
WORKDIR /usr/src/app

COPY NodeJs/package.json .
COPY NodeJs/package-lock.json .

RUN npm install

COPY NodeJs .

EXPOSE 3000

CMD [ "node", "app.js" ]