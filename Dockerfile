FROM node:slim

WORKDIR /ecommerce

COPY package*.json /

RUN npm install

COPY . /ecommerce 

EXPOSE 4000

CMD node app.js
