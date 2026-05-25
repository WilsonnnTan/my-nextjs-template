import { Prisma } from '@/generated/prisma/client';
import { AuthAPIHelper } from '@/lib/auth/auth-api-helper';
import { logError } from '@/lib/logger';
import { ZodError } from 'zod';

import { ApiError } from './error';
import { jsend } from './jsend';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  image?: string | null;
}

type ApiHandlerContext<T = unknown, TUser = User | null> = {
  user: TUser;
  params: T;
  req: Request;
};

function handleApiError(err: unknown, req: Request) {
  const action = req.method + ' ' + new URL(req.url).pathname;
  logError(err, { action });

  if (err instanceof ApiError) {
    return jsend.fail({ message: err.message }, err.status);
  }

  if (err instanceof ZodError) {
    const fieldErrors = err.flatten().fieldErrors;
    const flatErrors: Record<string, string> = {};
    for (const [key, errors] of Object.entries(fieldErrors)) {
      flatErrors[key] = (errors as string[])?.[0] || 'Invalid value';
    }

    return jsend.fail(flatErrors, 400);
  }

  // Prisma Error Handling
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const code = err.code;

    if (code === 'P2002') {
      return jsend.fail({ message: 'Resource already exists' }, 400);
    }
    if (code === 'P2025') {
      return jsend.fail({ message: 'Resource not found' }, 404);
    }
  }

  return jsend.error(
    err instanceof Error ? err.message : 'Internal Server Error',
    500,
  );
}

/**
 * Higher-order function to wrap public API routes with standardized error handling and async params.
 * @param handler The actual route logic
 * @returns A Next.js API route handler
 */
export function withApiPublic<T = unknown>(
  handler: (context: ApiHandlerContext<T>) => Promise<Response>,
) {
  return async (req: Request, { params }: { params: Promise<T> }) => {
    try {
      const resolvedParams = await params;
      const user = await AuthAPIHelper.getUser();

      return await handler({
        user,
        params: resolvedParams,
        req,
      });
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}

/**
 * Higher-order function to wrap API routes with authentication and standardized error handling.
 * @param handler The actual route logic
 * @returns A Next.js API route handler
 */
export function withApiAuth<T = unknown>(
  handler: (context: ApiHandlerContext<T, User>) => Promise<Response>,
) {
  return async (req: Request, { params }: { params: Promise<T> }) => {
    try {
      const user = await AuthAPIHelper.requireUser();
      const resolvedParams = await params;

      return await handler({ user, params: resolvedParams, req });
    } catch (err) {
      return handleApiError(err, req);
    }
  };
}
