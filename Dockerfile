FROM node:20-alpine
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Exponer puerto
EXPOSE 4321

# Comando para desarrollo
CMD ["npm", "run", "dev"]