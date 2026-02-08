# Security Configuration Guide

This file contains security header configurations for different web servers.

## For Apache (.htaccess)
The `.htaccess` file in the root directory contains all necessary security headers.
Just upload it to your web root and Apache will apply the headers automatically.

## For Nginx
Add this to your nginx.conf or site configuration:

```nginx
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com https://kit.fontawesome.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://www.paypal.com; frame-src https://www.paypal.com; object-src 'none';" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Force HTTPS (uncomment if you have SSL)
# if ($scheme != "https") {
#     return 301 https://$server_name$request_uri;
# }
```

## For Netlify
Create a `_headers` file in your root directory:

```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com https://kit.fontawesome.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://www.paypal.com; frame-src https://www.paypal.com; object-src 'none';
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## For Vercel
Create a `vercel.json` file in your root directory:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com https://kit.fontawesome.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://www.paypal.com; frame-src https://www.paypal.com; object-src 'none';"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

## Testing Your Headers
After deployment, test your security headers at:
- https://securityheaders.com/
- https://observatory.mozilla.org/

## Notes
- The CSP policy includes 'unsafe-inline' for scripts because of inline event handlers
- Adjust the CSP as needed if you add more external resources
- Always test after enabling to ensure nothing breaks
