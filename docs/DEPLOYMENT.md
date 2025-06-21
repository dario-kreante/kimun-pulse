# Deployment Instructions

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project (configured)

## Environment Variables
Copy `.env.example` to `.env` and fill in the required values:

```
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
JWT_SECRET=...
```

## Build and Run

```bash
# Install dependencies
npm install

# Run database migrations (if needed)
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Security Considerations
- Never commit `.env` or sensitive data to version control.
- Ensure HTTPS is used in production.
- Review Supabase RLS policies before going live. 