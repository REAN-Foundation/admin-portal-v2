FROM node:24-alpine3.22 AS builder

WORKDIR /app
COPY . .

RUN npm install -g typescript
RUN npm install
RUN npm run build

#######################################

FROM node:24-alpine3.22

RUN apk add --no-cache \
        bash \
        unzip \
        git \
        curl \
        expat \
        openssl \
    && rm -rf /var/cache/apk/*
RUN apk add --update alpine-sdk

RUN apk update
RUN apk upgrade

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
 && unzip awscliv2.zip \
 && ./aws/install \
 && rm -rf aws awscliv2.zip

WORKDIR /app

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

