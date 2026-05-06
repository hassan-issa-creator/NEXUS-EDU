FROM node:18-alpine AS builder

WORKDIR /app

# Copy generic package files
COPY package*.json ./
COPY turbo.json ./

# Copy app specific package files
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
# If you have packages/ copy them too
# COPY packages/*/package*.json ./packages/*/

# Install dependencies (from root)
RUN npm ci

# Copy source code
COPY . .

# Build the API
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

# Expose port
EXPOSE 4000

# Start command
CMD ["node", "dist/main"]
