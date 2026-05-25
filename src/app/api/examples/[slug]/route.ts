import { withApiPublic } from '@/lib/api-helper/api-wrapper';
import { ApiError } from '@/lib/api-helper/error';
import { jsend } from '@/lib/api-helper/jsend';

type ExampleSlugParams = {
  slug: string;
};

export const GET = withApiPublic<ExampleSlugParams>(
  async ({ params, user }) => {
    const { slug } = params;

    if (!slug) {
      throw ApiError.badRequest('Route param "slug" is required');
    }

    return jsend.success({
      message: 'Dynamic params example succeeded',
      slug,
      isLoggedIn: Boolean(user),
      userId: user?.id ?? null,
    });
  },
);
