# Wardobie - Deployment Guide

## Prerequisites

- Backend API deployed and accessible
- S3 bucket configured for image storage
- Google OAuth credentials for production domain
- Hosting platform account (Vercel, Netlify, AWS, etc.)

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Google OAuth Setup for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to Credentials
4. Edit your OAuth 2.0 Client
5. Add Authorized JavaScript origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
6. Add Authorized redirect URIs:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
7. Save changes

## Deployment Options

### Option 1: Vercel (Recommended)

#### One-Click Deploy
1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure environment variables:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_API_BASE_URL`
5. Deploy

#### CLI Deploy
```bash
npm install -g vercel
vercel
```

Configuration (vercel.json):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### Option 2: Netlify

#### One-Click Deploy
1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. New site from Git
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables
6. Deploy

#### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: AWS S3 + CloudFront

1. Build the project:
```bash
npm run build
```

2. Create S3 bucket:
```bash
aws s3 mb s3://wardobie-frontend
aws s3 website s3://wardobie-frontend --index-document index.html
```

3. Upload build:
```bash
aws s3 sync dist/ s3://wardobie-frontend
```

4. Configure CloudFront for HTTPS
5. Update DNS to point to CloudFront

### Option 4: Docker

Dockerfile:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

nginx.conf:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Build and run:
```bash
docker build -t wardobie-frontend .
docker run -p 80:80 wardobie-frontend
```

## Build Optimization

### Analyze Bundle Size
```bash
npm run build -- --mode=analyze
```

### Performance Checklist
- [x] Images lazy loaded (add if needed)
- [x] Code splitting with React.lazy (add if needed)
- [x] Minification enabled
- [x] Gzip compression
- [x] CDN for static assets

### Vite Build Configuration

vite.config.js optimization:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@react-oauth/google', 'axios'],
        }
      }
    }
  }
})
```

## Post-Deployment Checklist

### Functional Testing
- [ ] Google OAuth login works
- [ ] Can upload images
- [ ] Processing status updates
- [ ] Can review and approve items
- [ ] Wardrobe displays items
- [ ] Category filtering works
- [ ] Can generate outfits
- [ ] Can save/unsave outfits
- [ ] Logout works

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] Images load in < 2s
- [ ] API responses < 1s
- [ ] No console errors

### Security Checklist
- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] CORS configured correctly
- [ ] CSP headers set (optional)
- [ ] OAuth redirect URIs whitelisted

### SEO (Optional)
- [ ] Meta tags added
- [ ] Open Graph tags
- [ ] Sitemap generated
- [ ] Robots.txt configured

## Monitoring

### Error Tracking
Consider integrating:
- Sentry
- LogRocket
- Rollbar

Example Sentry setup:
```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

### Analytics
Add Google Analytics or similar:
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## CI/CD Pipeline

### GitHub Actions Example

.github/workflows/deploy.yml:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
      env:
        VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## Rollback Strategy

### Vercel
- Use Vercel dashboard to rollback to previous deployment
- Or redeploy specific commit

### Netlify
- Use Netlify dashboard to restore previous deploy
- Or use CLI: `netlify deploy --prod --dir=dist`

### Manual Rollback
1. Checkout previous working commit
2. Build and deploy
3. Verify functionality

## Maintenance

### Regular Updates
```bash
npm outdated
npm update
npm audit fix
```

### Dependency Security
- Enable Dependabot on GitHub
- Regular security audits
- Update React and major dependencies quarterly

## Troubleshooting

### "White screen after deployment"
- Check browser console for errors
- Verify environment variables are set
- Check base URL in vite.config.js
- Ensure routing redirects are configured

### "OAuth not working in production"
- Verify production domain in Google Console
- Check redirect URIs match exactly
- Clear browser cache
- Test in incognito mode

### "API calls failing"
- Check CORS configuration on backend
- Verify API_BASE_URL is correct
- Check network tab for actual errors
- Ensure backend is accessible

### "Slow load times"
- Enable CDN
- Optimize images
- Enable caching headers
- Use code splitting

## Cost Estimation

### Hosting
- **Vercel/Netlify Free Tier**: $0/month (100GB bandwidth)
- **Vercel Pro**: $20/month (1TB bandwidth)
- **AWS S3 + CloudFront**: ~$5-20/month (depends on traffic)

### Bandwidth
- Estimate: 100MB per user session
- 10,000 users/month = ~1TB bandwidth

## Support

For deployment issues:
1. Check hosting provider documentation
2. Review error logs
3. Test locally with production build: `npm run build && npm run preview`
4. Contact hosting support

## Next Steps After Deployment

1. Set up monitoring and alerts
2. Configure CDN for images
3. Implement analytics
4. Set up backup strategy
5. Create staging environment
6. Document runbook for common issues
