FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install -g serve

COPY . .

# Build the app
RUN npm run build

# Serve the build output
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
