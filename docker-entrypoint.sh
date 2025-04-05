#!/bin/sh
# File: docker-entrypoint.sh

# Create the env.js file with environment variables
echo "console.log('Loading runtime environment configuration');" > /usr/share/nginx/html/env.js
echo "window.env = {" >> /usr/share/nginx/html/env.js
echo "  VITE_API_URL: \"$VITE_API_URL\"," >> /usr/share/nginx/html/env.js
# Add any other environment variables you need here
echo "};" >> /usr/share/nginx/html/env.js

# Start Nginx
exec nginx -g 'daemon off;'
