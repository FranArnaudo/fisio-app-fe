# Stage 1: Build the production assets
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app (outputs static assets in the "dist" folder)
# Note: We're not setting VITE_API_URL here anymore
RUN npm run build

# Stage 2: Serve the static assets with Nginx
FROM nginx:alpine

# Copy the built assets from the build stage to the default Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx config to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy our entrypoint script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Expose port 80 for HTTP traffic
EXPOSE 80

# Use our custom entrypoint script
ENTRYPOINT ["/bin/sh", "/docker-entrypoint.sh"]