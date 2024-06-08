FROM node:20.14-alpine

LABEL maintainer="Dmitry Rodin <madiedinro@gmail.com>"

# ARG NPM_CONFIG_REGISTRY_ARG=https://registry.npmjs.org

ENV TZ UTC
ENV LOG_LEVEL warn

RUN apk add python3 --no-cache make build-base gcc git curl

WORKDIR /usr/src/rockme

ARG NPM_CONFIG_REGISTRY_ARG=https://registry.npmjs.org
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY_ARG    

RUN npm set registry $NPM_CONFIG_REGISTRY_ARG

COPY package.json .
# COPY package-lock.json .
# RUN npm shrinkwrap

# RUN  npm ci  --loglevel http --platform=linux && npm cache clean --force
RUN  npm install && npm cache clean --force

COPY . .

# RUN yarn build && yarn link && npm link
RUN npm run build  --loglevel http && npm link  --loglevel http

