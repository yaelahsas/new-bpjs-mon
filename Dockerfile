FROM node:20-alpine AS base

# ---- Dependencies ----
FROM base AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Production ----
FROM base AS runner
RUN apk add --no-cache python3 make g++ tini
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/ws-server.ts ./ws-server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/data ./data
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Rebuild native modules for the target platform
RUN npm rebuild better-sqlite3

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npx", "tsx", "server.ts"]
