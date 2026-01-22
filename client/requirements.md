## Packages
framer-motion | Essential for the ripple animations, shakes, and card transitions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes efficiently

## Notes
- The app relies on the `verbs` table having JSONB columns for tenses (presente, passato_prossimo, etc.)
- Frontend assumes the JSON structure matches the `ConjugationMap` (io, tu, lui/lei, noi, voi, loro)
- Game logic (randomization) happens client-side after fetching the full verb list
