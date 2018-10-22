FROM node:8-alpine

LABEL maintainer="Dmitry Rodin <madiedinro@gmail.com>"
LABEL band.base-ts.version="1.8.5"

ENV TZ UTC
ENV LOG_LEVEL warn

RUN apk add python --no-cache make build-base gcc git curl

WORKDIR /usr/src/rockme

COPY package.json .
COPY yarn.lock .

RUN yarn install \
  && yarn cache clean

COPY . .

RUN yarn build && yarn link
