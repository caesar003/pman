import {redirect} from '@remix-run/node';
import {Outlet} from '@remix-run/react';
import {db} from '~/utils/db.server';
import {getUser} from '~/utils/session.server';

export const loader = async ({request}) => {
    const user = await getUser(request);
    if (!user) return redirect('/auth/signin');

    return user;
};

export default function atest() {
    return (
        <div>
            <Outlet />
        </div>
    );
}
