# Getting Started

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)

## 1. Clone and install

```bash
git clone https://github.com/cinblockchain91/simpleinvoice.git
cd simpleinvoice
pnpm install
```

## 2. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Open `apps/web/.env.local` and fill in the 101 Digital sandbox credentials:

```env
DIGITAL_CLIENT_ID=qlsGKsgR3Qt4M_oSAvRq2yChEpUa
DIGITAL_CLIENT_SECRET=GE7sxz9a4J6bw9LyPxkr4syV6pdLiMvYu2o_fDfnWgUa
DIGITAL_AUTH_BASE_URL=https://is-wso2-dev.101digital.io
DIGITAL_API_BASE_URL=https://api-neobank-dev.101digital.io
```

> These values are from the assessment Appendix A. Never commit `.env.local`.

## 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/en/login`.

**Login credentials (sandbox):**

| Field    | Value            |
| -------- | ---------------- |
| Username | `94756921275`    |
| Password | `Password@12345` |
