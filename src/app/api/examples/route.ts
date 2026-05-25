import { withApiAuth, withApiPublic } from '@/lib/api-helper/api-wrapper';
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
    isLoggedIn: Boolean(user),
    userId: user?.id ?? null,
  });
});

export const POST = withApiAuth(async ({ user }) => {
  return jsend.success({
    message: 'Authenticated request succeeded',
    user: {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role ?? null,
    },
  });
});
