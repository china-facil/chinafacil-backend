FROM node:22-alpine AS base

RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY newrelic.js ./

RUN npm ci

COPY . .

RUN npx prisma generate

FROM base AS development
ENV NODE_ENV=development
CMD ["npm", "run", "start:dev"]

FROM base AS build
RUN npm run build

FROM node:22-alpine AS production

RUN apk add --no-cache openssl openssl-dev libc6-compat

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY newrelic.js ./

RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
