FROM node:24-alpine3.22 AS builder

WORKDIR /app
COPY . .

RUN npm install -g typescript
RUN npm install
RUN npm run build

#######################################

FROM node:24-alpine3.22

RUN apk add bash
RUN apk add --no-cache \
        # python3 \
        aws-cli \
        git \
        curl \
        expat \
        openssl \
    && rm -rf /var/cache/apk/*
RUN apk add --update alpine-sdk
# RUN apk add chromium \
#     harfbuzz
# RUN apk --no-cache add aws-cli

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

RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/bin/bash", "-c", "/app/entrypoint.sh $ENVIRONMENT"]
# CMD ["node", "build/index.js"]
