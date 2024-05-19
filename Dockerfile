FROM node:18.19.1-alpine3.18

LABEL maintainer="Dmitry Rodin <madiedinro@gmail.com>"
LABEL band.base-ts.version="2.2.0"

ENV TZ UTC
ENV LOG_LEVEL warn

RUN apk add python3 --no-cache make build-base gcc git curl

WORKDIR /usr/src/rockme

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN yarn build && yarn link
