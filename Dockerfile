FROM node:18.19.1-alpine3.18

LABEL maintainer="Dmitry Rodin <madiedinro@gmail.com>"

ENV TZ UTC
ENV LOG_LEVEL warn

RUN apk add python3 --no-cache make build-base gcc git curl

WORKDIR /usr/src/rockme

COPY package.json .
COPY package-lock.json .
COPY .npmrc .

RUN npm ci  --loglevel http --platform=linux && npm cache clean --force

COPY . .
RUN rm -f .npmrc

# RUN yarn build && yarn link && npm link
RUN npm run build  --loglevel http && npm link  --loglevel http

