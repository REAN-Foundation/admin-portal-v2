FROM node:24-alpine3.22 AS builder

WORKDIR /app
COPY . .

RUN npm install -g typescript
RUN npm install
RUN npm run build

#######################################

FROM node:24-alpine3.22

RUN apk update && apk upgrade && \
    apk add --no-cache \
        bash \
        git \
        curl \
        expat \
        openssl \
        alpine-sdk \
        python3 \
        py3-pip \
    && rm -rf /var/cache/apk/*

# Install AWS CLI v1 and upgrade urllib3 to fix CVE
RUN pip3 install --break-system-packages --no-cache-dir \
    awscli \
    urllib3>=2.2.3

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

