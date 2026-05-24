#!/bin/sh

#Generate runtime config from environment variables
cat <<EOF > /usr/share/nginx/html/config.js
window.__CONFIG__ = {
  CLOUDFRONT_URL: "${CLOUDFRONT_URL:-$VITE_CLOUDFRONT_URL}",
  STRIPE_PUBLISHABLE_KEY: "${STRIPE_PUBLISHABLE_KEY:-$VITE_STRIPE_PUBLISHABLE_KEY}"
};
EOF

#Start nginx
exec nginx -g "daemon off;"