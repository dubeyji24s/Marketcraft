# Production image: builds the React client, then runs the API which also serves it.
FROM node:22-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
# the client build shares a few pure modules with the server (Starter engine, Guard, play rules)
COPY server/src/ /app/server/src/
# Firebase web config is baked into the bundle at build time
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_APP_ID
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production PORT=4000
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=client /app/client/dist /app/client/dist
RUN mkdir -p data uploads && chown -R node:node /app
USER node
EXPOSE 4000
VOLUME ["/app/server/data", "/app/server/uploads"]
CMD ["node", "src/index.js"]
