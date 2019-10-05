FROM node:carbon

WORKDIR /usr/src/app

COPY Nodejs/NodeJs/package.json .
COPY NodeJs/NodeJs/package-lock.json .
RUN npm install

COPY NodeJs .

EXPOSE 3000

CMD [ "node", "app.js" ]