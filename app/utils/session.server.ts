import bycrypt from 'bcrypt';
import {db} from './db.server';

import {createCookieSessionStorage, redirect} from '@remix-run/node';
interface Credentials {
    username: string;
    password: string;
    email?: string | undefined;
}
export async function signin({username, password}: Credentials) {
    const user = await db.user.findUnique({
        where: {
            username,
        },
    });

    if (!user) return null;
    const isCorrectPassword = await bycrypt.compare(
        password,
        user.passwordHash,
    );
    if (!isCorrectPassword) return null;
    return user;
}

export async function signup({username, password, email}: Credentials) {
    const passwordHash = await bycrypt.hash(password, 10);
    return db.user.create({
        data: {
            username,
            passwordHash,
            email,
        },
    });
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) throw new Error('No session secret');

const storage = createCookieSessionStorage({
    cookie: {
        name: 'project_manager',
        secure: process.env.NODE_ENV === 'production',
        secrets: [sessionSecret],
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 60,
        httpOnly: true,
    },
});

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await storage.getSession();
    session.set('userId', userId);
    return redirect(redirectTo, {
        headers: {
            'Set-Cookie': await storage.commitSession(session),
        },
    });
}

export function getUserSession(request: Request) {
    return storage.getSession(request.headers.get('Cookie'));
}

export async function getUser(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get('userId');
    if (!userId || typeof userId !== 'string') return null;
    try {
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                username: true,
                id: true,
                email: true,
            },
        });
        return user;
    } catch (e) {
        return null;
    }
}

export async function signout(request: Request) {
    const session = await storage.getSession(request.headers.get('Cookie'));
    return redirect('/auth/signout', {
        headers: {
            'Set-Cookie': await storage.destroySession(session),
        },
    });
}
