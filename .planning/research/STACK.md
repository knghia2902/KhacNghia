# STACK

## Current Stack Review
- **Frontend**: Vite, React 19, TailwindCSS v4
- **Backend/DB**: Supabase (PostgreSQL under the hood)
- **Deployment**: Vercel

## Research Findings
For deploying a React single-page app (SPA) or Vite bundle to Vercel connecting to Supabase:
- **Supabase Client**: Standard `@supabase/supabase-js`.
- **Latency Drivers**: Vercel Edge/Serverless functions cold starts (though this is a SPA, so direct client-to-Supabase REST connections are happening from the browser instead of Vercel functions). If it's pure SPA, the connection slowness is tied to the geographical distance between the user's browser and the Supabase region, or unoptimized data fetching causing huge payloads.
- **Recommendations**: 
  - Ensure Supabase project is hosted in a region close to users (e.g., Singapore for VN).
  - Use React's `useMemo` / `useEffect` carefully to avoid infinite request loops.
  - Apply Pagination if the initial load pulls too many documents.
