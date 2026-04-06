# ColabX Backend Deployment

## 1) Environment variables

Copy `.env.example` to `.env` and set real values.

Required:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`

Recommended for production:
- `NODE_ENV=production`
- `PORT` (provided by many hosts)
- `BACKEND_URL` and/or `BETTER_AUTH_URL`
- `CORS_ORIGINS` and `TRUSTED_ORIGINS`

Optional:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

If Google OAuth vars are not set, Google login is disabled automatically.

## 2) Local production run

```bash
npm ci
npm run build
npm run db:migrate
npm start
```

Health endpoint:
- `GET /health`

## 3) Docker deployment

Build image:

```bash
docker build -t colabx-backend .
```

Run container:

```bash
docker run --env-file .env -p 3000:3000 colabx-backend
```

## 4) Platform deployment checklist

- Configure all required environment variables
- Ensure database is reachable from deployment network
- Run migrations before first traffic: `npm run db:migrate`
- Route health checks to `/health`
- Ensure frontend origin is in `CORS_ORIGINS` and `TRUSTED_ORIGINS`
- Keep `BETTER_AUTH_SECRET` stable across restarts/instances so OAuth state cookies remain valid
