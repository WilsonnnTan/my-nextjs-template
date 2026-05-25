# My Next.js Template - Full Stack Setup

A comprehensive Next.js template for building full-stack applications with modern best practices. This template includes authentication, database integration, testing, and linting configured and ready to use.

## Features

- Next.js with TypeScript
- Prisma ORM for database management
- Better Auth for authentication
- ESLint configuration
- Vitest for testing
- Tailwind for styling

## Authentication

This template uses Better Auth and includes helpers for both pages and API routes.

- [src/lib/auth/auth-page-helper.ts](src/lib/auth/auth-page-helper.ts)
- [src/lib/auth/auth-api-helper.ts](src/lib/auth/auth-api-helper.ts)
- [src/lib/api-helper/api-wrapper.ts](src/lib/api-helper/api-wrapper.ts)

### Protecting Pages

Use `AuthPageHelper.requireUser()` in a server page. If no session exists, it redirects to the login page.

```ts
import { AuthPageHelper } from '@/lib/auth/auth-page-helper';

export default async function DashboardPage() {
  const user = await AuthPageHelper.requireUser();

  return <div>Welcome, {user.name}</div>;
}
```

### Protecting APIs

Use the API wrappers instead of checking the session manually in each route:

- `withApiPublic(...)` for routes that can be accessed without login
- `withApiAuth(...)` for routes that require login

## API Helpers

The API layer provides:

- `jsend` for standardized JSON responses
- `ApiError` for throwing HTTP-friendly errors
- `withApiPublic` and `withApiAuth` for route wrapping

Source files:

- [src/lib/api-helper/jsend.ts](src/lib/api-helper/jsend.ts)
- [src/lib/api-helper/api-wrapper.ts](src/lib/api-helper/api-wrapper.ts)
- [src/lib/api-helper/error.ts](src/lib/api-helper/error.ts)

Example routes:

- [src/app/api/examples/route.ts](src/app/api/examples/route.ts)
- [src/app/api/examples/[slug]/route.ts](src/app/api/examples/[slug]/route.ts)

### Route Usage

Public route:

```ts
import { withApiPublic } from '@/lib/api-helper/api-wrapper';
import { ApiError } from '@/lib/api-helper/error';
import { jsend } from '@/lib/api-helper/jsend';

export const GET = withApiPublic(async ({ req, user }) => {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    throw ApiError.badRequest('Query param "name" is required');
  }

  return jsend.success({
    message: `Hello, ${name}!`,
    userId: user?.id ?? null,
  });
});
```

Protected route:

```ts
import { withApiAuth } from '@/lib/api-helper/api-wrapper';
import { jsend } from '@/lib/api-helper/jsend';

export const POST = withApiAuth(async ({ user }) => {
  return jsend.success({
    id: user.id,
    email: user.email,
  });
});
```

Dynamic route params:

```ts
type ExampleSlugParams = {
  slug: string;
};

export const GET = withApiPublic<ExampleSlugParams>(async ({ params }) => {
  return jsend.success({ slug: params.slug });
});
```

### Responses With `jsend`

Use `jsend` for consistent responses:

```ts
return jsend.success({ id: '123' });
return jsend.fail({ message: 'Invalid input' }, 400);
return jsend.error('Something went wrong', 500);
```

### Errors With `ApiError`

Throw `ApiError` inside wrapped routes and the wrapper will convert it into a JSend response with the matching HTTP status.

```ts
throw ApiError.badRequest('Email is required');
throw ApiError.notFound('Post not found');
throw ApiError.custom('Upstream service failed', 502);
```

### Built-in Wrapper Error Handling

The API wrapper already handles these cases for you:

- `ApiError` returns `jsend.fail(...)` with the error message and HTTP status
- `ZodError` returns field validation errors with status `400`
- Prisma `P2002` returns `400`
- Prisma `P2025` returns `404`
- unknown errors return `jsend.error(...)` with status `500`

## Contributing

We welcome contributions to help improve this template! Please take a look at our [Contributing Guidelines](CONTRIBUTING.md) for more details on how to get started and the submission process.
