# [Project Name] - GitHub Copilot Instructions

## Project Context
[Project Name] is a [Description] built with modern technologies.

## Technology Stack

### Frontend
- React 19 with TypeScript (strict)
- Vite, TailwindCSS
- [State Management Lib]

### Backend
- Node.js with Express
- TypeScript (strict)
- Prisma ORM (PostgreSQL)

## Code Generation Guidelines

### General Principles
1. **Type Safety First**: Always use TypeScript with strict mode.
2. **Async/Await**: Use async/await pattern.
3. **Error Handling**: Use try-catch blocks and log errors.

### React Component Patterns
```typescript
interface Props {
  data: string;
}

export const Component: React.FC<Props> = ({ data }) => {
  return <div>{data}</div>;
};
```

### API Endpoint Patterns
```typescript
import { z } from 'zod';

export const handler = async (req, res) => {
  try {
    // Logic
  } catch (error) {
    // Error handling
  }
};
```

## Important Reminders
1. **Never commit secrets**
2. **Validate inputs**
3. **Use transactions** for DB writes
