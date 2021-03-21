FROM node:alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci --no-audit

COPY tsconfig.json tsconfig.build.json nest-cli.json /app/
