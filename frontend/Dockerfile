FROM node:18

WORKDIR /app

# Copy package definitions and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of your source
COPY . .

# Build the app
RUN npm run build

# Expose port for preview
EXPOSE 80

# Default command for serving frontend
CMD ["npm", "run", "preview", "--", "--port", "80", "--host"]
