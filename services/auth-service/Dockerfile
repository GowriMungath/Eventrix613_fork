# Production build for the auth service
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application code
COPY --chown=node:node ./src ./src

ENV NODE_ENV=production

# Ensure the node user owns the workspace
RUN chown -R node:node /app
USER node

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "src/server.js"]