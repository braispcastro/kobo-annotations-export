# Production-ready Dockerfile for Kobo Annotations Viewer
# Expects the app to be pre-built locally from source (bun run build)
FROM oven/bun:1.3-alpine
WORKDIR /app

# Copy dependency files and pre-built files
COPY package.json bun.lock* ./
COPY . .

# Install production dependencies (cookie, etc.) required by the SSR adapter
RUN bun install --production

# Final environment setup
VOLUME /app/data
EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Run the SSR server (flexible path for entry.mjs)
CMD ["sh", "-c", "if [ -f ./server/entry.mjs ]; then bun ./server/entry.mjs; elif [ -f ./dist/server/entry.mjs ]; then bun ./dist/server/entry.mjs; else echo 'Error: entry.mjs not found'; exit 1; fi"]
