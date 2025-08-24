FROM node:18

WORKDIR /app

# Copy package definitions and install deps
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port for preview/serve
EXPOSE 80

# Default command (can be overridden by docker-compose exec)
CMD ["npm", "run", "preview", "--", "--port", "80", "--host"]
