# PITFALLS

## Common Mistakes (React + Supabase + Vercel)
1. **Unpaginated Fetches**: `const { data } = await supabase.from('docs').select('*')` grabs everything, crashing memory or bandwidth.
   - *Prevention*: Always use `.select('id, title, ...')` and `.range(0, 50)`.
2. **Missing Dependency Arrays in `useEffect`**: Causes infinite DB calling loops.
   - *Prevention*: Lint checks and strict dependency handling.
3. **Large File Bloat in DOM**: `Docs.jsx` being over 100KB means bundle splitting might be needed. Vercel deployment of huge static files is fast, but parsing them blocks the browser main thread making the DB connection "feel" slow (perceived latency).
