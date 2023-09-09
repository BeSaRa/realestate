FROM node:18-alpine3.17 as build
LABEL authors="ahmedbesara@gmail.com"

RUN mkdir -p app

WORKDIR /app/

COPY package.json /app/

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build


FROM nginx:latest

COPY default.conf etc/nginx/conf.d/

COPY --from=build /app/dist/real-estate/browser /usr/share/nginx/html
