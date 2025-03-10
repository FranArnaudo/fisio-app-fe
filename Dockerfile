# Stage 1: Build the production assets using Node.js
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Set the API URL for build time (this value is baked into your build)
ENV VITE_API_URL="http://www.axis.fisioapp.com.ar:8080"

# Copy the rest of the application code
COPY . .

# Build the app (outputs static assets in, e.g., the "dist" folder)
RUN npm run build

# Stage 2: Serve the static assets with Nginx
FROM nginx:alpine

# Copy the built assets from the build stage to the default Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx config to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
