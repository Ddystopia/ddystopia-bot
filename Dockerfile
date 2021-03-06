FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i

COPY . .

CMD [ "npm", "start" ]