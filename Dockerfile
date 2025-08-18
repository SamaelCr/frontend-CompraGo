# -------- Base --------
    FROM node:20-alpine AS base
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    
    # -------- Dev --------
    FROM base AS dev
    COPY . .
    EXPOSE 4321
    CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4321"]
    
    # -------- Build --------
    FROM base AS build
    COPY . .
    RUN npm run build
    
    # -------- Runtime (prod) --------
    FROM node:20-alpine AS runtime
    WORKDIR /app
    COPY --from=build /app/dist ./dist
    COPY --from=build /app/node_modules ./node_modules
    ENV HOST=0.0.0.0
    ENV PORT=4321
    EXPOSE 4321
    CMD ["node", "./dist/server/entry.mjs"]