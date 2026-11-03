# Multi-stage production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm --prefix backend install --omit=dev
RUN npm --prefix frontend install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend production bundle
RUN npm --prefix frontend run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules and built assets from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["node", "backend/server.js"]
