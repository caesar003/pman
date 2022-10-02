import {redirect} from '@remix-run/node';
import {signout} from '~/utils/session.server';

export const action = async ({request}) => {
    return signout(request);
};

export const loader = async () => {
    return redirect('/auth/signin');
};
