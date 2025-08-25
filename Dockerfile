FROM node:18.20.8-alpine3.21 AS builder

WORKDIR /app
COPY . .

RUN npm install -g typescript
RUN npm install
RUN npm run build

#######################################

FROM node:18.20.8-alpine3.21

RUN apk add bash gcc musl-dev python3-dev libffi-dev openssl-dev cargo make dos2unix

RUN apk add --no-cache \
        python3 \
        py3-pip \
        git \
    && pip3 install --break-system-packages azure-cli \
    && rm -rf /var/cache/apk/*
RUN apk add --update alpine-sdk


RUN apk update
RUN apk upgrade

WORKDIR /app
# RUN rm -rf ./*

COPY --from=builder ./app/ ./
# COPY --from=builder ./app/build .
# COPY --from=builder ./app/entrypoint.sh ./

RUN npm install

ARG ORIGIN
ENV ORIGIN=${ORIGIN}

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}

ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV BODY_SIZE_LIMIT=52428800

RUN dos2unix /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/bin/bash", "-c", "/app/entrypoint.sh $ENVIRONMENT"]
# CMD ["node", "build/index.js"]
