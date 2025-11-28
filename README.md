# React + TypeScript + Vite + MSW + Vitest

## Considerations for a production-grade quality

- Sensible UI for loading and error states
- Abstraction over fetch with that will handle authentication, django specific error formatting (maybe?), handle hanging requests and whatnot, or just pick something off the shelf
- Is there a better place to do aggregation related calculations? Backend? BFF?
