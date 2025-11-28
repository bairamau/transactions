# React + TypeScript + Vite + MSW + Vitest

## Requirements

Recommended Node.js versions: **20.19+** or **22.12+**

## Getting Started

### Run in development mode
```bash
npm run dev
```

### Run tests
```bash
npm test
```

### Production preview
```bash
npm run build
npm run preview
```

## Considerations for a production-grade quality

- Sensible UI for loading and error states
- Abstraction over fetch with that will handle authentication, django specific error formatting (maybe?), handle hanging requests and whatnot, or just pick something off the shelf
- Is there a better place to do aggregation related calculations? Backend? BFF?
