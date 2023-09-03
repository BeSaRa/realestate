FROM node:current-alpine as build
LABEL authors="BeSaRa"

RUN mkdir -p app

WORKDIR /app/

COPY package.json /app/

RUN npm install -g npm@9.8.1

RUN npm install --legacy-peer-deps

COPY . /app/

RUN npm run build


FROM nginx:latest

COPY default.conf etc/nginx/conf.d/

ENV BE_URL http://welcome.com

ENV CMS_URL http//cms.com

COPY --from=build /app/dist/real-estate/browser /usr/share/nginx/html
