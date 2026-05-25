import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from './auth';

export const AuthPageHelper = {
  async requireUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return redirect('/id/login?session_expired=true');
    }
    return session.user;
  },
};
