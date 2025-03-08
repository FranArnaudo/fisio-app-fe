# Stage 1: Build the production assets using Node.js
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app (this should output your static assets, typically in the "dist" folder)
RUN npm run build

# Stage 2: Serve the static assets with Nginx
FROM nginx:alpine

# Copy the built assets from the build stage to the default Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to serve HTTP traffic
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
