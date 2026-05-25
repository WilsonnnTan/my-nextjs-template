import { headers } from 'next/headers';

import { ApiError } from '../api-helper/error';
import { auth } from './auth';

/**
 * Centralized authentication helpers for API routes
 */
export const AuthAPIHelper = {
  async getUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
  },

  async requireUser() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user) {
      throw ApiError.unauthorized('Unauthorized access attempt detected');
    }

    return session.user;
  },
};
