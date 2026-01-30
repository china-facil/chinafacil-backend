FROM node:22-alpine AS base

RUN apk add --no-cache \
  openssl openssl-dev libc6-compat \
  chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY newrelic.js ./

RUN npm ci

COPY . .

RUN if [ -f google_credentials.json ]; then \
      echo "Google credentials found and copied"; \
      ls -la google_credentials.json; \
    else \
      echo "Warning: google_credentials.json not found in build context"; \
    fi

RUN npx prisma generate

FROM base AS development
ENV NODE_ENV=development
CMD ["npm", "run", "start:dev"]

FROM base AS build
RUN npm run build

FROM node:22-alpine AS production

RUN apk add --no-cache \
  openssl openssl-dev libc6-compat \
  chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY newrelic.js ./

RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=base /app/google_credentials.json ./google_credentials.json

EXPOSE 3000
CMD ["node", "dist/main.js"]
