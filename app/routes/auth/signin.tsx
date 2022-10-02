import {json, redirect} from '@remix-run/node';
import {useActionData} from '@remix-run/react';
import {Button, Checkbox, Label, TextInput} from 'flowbite-react';
import {useState} from 'react';
import {db} from '~/utils/db.server';
import {
    createUserSession,
    getUser,
    signin,
    signup,
} from '~/utils/session.server';

interface Fields {
    signinType: string;
    username: string;
    email?: string;
    password: string;
    password1?: string;
}

const inputClasses = {
    normal: 'block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg pl-10 p-2.5 text-sm',
    error: 'block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-red-50 border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-red-700 dark:focus:border-red-400 dark:focus:ring-blue-500 rounded-lg pl-10 p-2.5 text-sm',
};

export const loader = async ({request}) => {
    const user = await getUser(request);
    if (user) return redirect('/');
    return null;
};
const validdateForm = (fields: Fields) => {
    const {signinType, username, email, password, password1} = fields;
    const emailFilter =
        /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    const obj: Fields = {
        signinType: '',
        email: '',
        username: '',
        password: '',
        password1: '',
    };

    if (!username || username.length === 0)
        obj.username = 'This field is required!';
    if (username && username.trim().indexOf(' ') !== -1)
        obj.username = "Username can't contain any spaces!";

    if (!email || email.length === 0) obj.email = 'This field is required!';
    if (email && !emailFilter.test(email))
        obj.email = 'Please provide valid email!';

    if (password.length === 0) obj.password = 'This field is required!';

    if (password.trim().length < 6)
        obj.password = 'Password must be at least six characters';
    if (!password1 || password !== password1)
        obj.password1 = 'Passwords do not match!';
    if (signinType === 'signin') {
        delete obj.password1;
        delete obj.email;
    }
    return obj;
};

const badRequest = (data) => json(data, {status: 400});
export const action = async ({request}) => {
    const form = await request.formData();
    const signinType = form.get('signinType');
    const username = form.get('username');
    const email = form.get('email');
    const password = form.get('password');
    const password1 = form.get('password1');

    const fields = {
        signinType,
        username,
        password,
        email,
        password1,
    };
    const fieldErrors = validdateForm(fields);

    if (Object.values(fieldErrors).some(Boolean))
        return badRequest({fieldErrors, fields});
    switch (signinType) {
        case 'signin': {
            const user = await signin({username, password});
            if (!user)
                return badRequest({
                    fields,
                    fieldErrors: {username: 'Invalid credentials'},
                });
            return createUserSession(user.id, '/');
        }
        case 'signup': {
            const userExists = await db.user.findFirst({
                where: {
                    username,
                },
            });
            const emailExists = await db.user.findFirst({
                where: {
                    email,
                },
            });
            if (userExists)
                return badRequest({
                    fields,
                    fieldErrors: {username: `User ${username} already exists!`},
                });
            if (emailExists)
                return badRequest({
                    fields,
                    fieldErrors: {email: `Email ${email} already exists!`},
                });
            const user = await signup({username, password, email});
            if (!user)
                return badRequest({
                    fields,
                    formError: 'Something went wrong!',
                });

            return createUserSession(user.id, '/');
        }
    }
    return {fields, fieldErrors};
};
export default function Signin() {
    const actionData = useActionData();
    const {error, normal} = inputClasses;
    const isSigninIn = () => {
        if (!actionData) return true;
        if (actionData.fields.signinType === 'signin') return true;

        return false;
    };
    const [isSigninSelected, selectSignin] = useState(isSigninIn);
    return (
        <div className='grid grid-cols-11 gap-4'>
            <div className='col-start-2 col-end-11 md:col-start-5 lg:col-start-6 xl:col-start-7 xl:col-end-10 border p-6 rounded'>
                <h3 className='text-[25px]'>Please Sign in to Continue</h3>
                <form method='post' className='flex flex-col gap-4 mt-3'>
                    <div className='flex'>
                        <div className='flex items-center mr-4'>
                            <input
                                id='inline-radio'
                                type='radio'
                                value='signin'
                                name='signinType'
                                defaultChecked={isSigninSelected}
                                onChange={() => selectSignin(true)}
                                className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                            />
                            <label
                                htmlFor='inline-radio'
                                className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'
                            >
                                Sign in
                            </label>
                        </div>
                        <div className='flex items-center mr-4'>
                            <input
                                id='inline-2-radio'
                                type='radio'
                                value='signup'
                                name='signinType'
                                defaultChecked={!isSigninSelected}
                                onChange={() => selectSignin(false)}
                                className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                            />
                            <label
                                htmlFor='inline-2-radio'
                                className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'
                            >
                                Sign up
                            </label>
                        </div>
                    </div>
                    <div>
                        <div className='mb-2 block'>
                            <label
                                className='text-sm font-medium text-gray-900 dark:text-gray-300'
                                htmlFor='username'
                            >
                                Username
                            </label>
                        </div>

                        <div className='flex'>
                            <div className='relative w-full'>
                                <div className='flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth={1.5}
                                        stroke='currentColor'
                                        className='w-6 h-6'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
                                        />
                                    </svg>
                                </div>
                                <input
                                    className={
                                        actionData?.fieldErrors?.username
                                            ? error
                                            : normal
                                    }
                                    id='username'
                                    type='text'
                                    name='username'
                                    placeholder='Your name'
                                    defaultValue={
                                        actionData?.fields?.username &&
                                        actionData?.fields?.username
                                    }
                                />
                            </div>
                        </div>
                        <p className='mt-2 text-sm text-red-600 dark:text-red-500'>
                            {actionData?.fieldErrors?.username &&
                                actionData?.fieldErrors?.username}
                        </p>
                    </div>
                    {!isSigninSelected && (
                        <div>
                            <div className='mb-2 block'>
                                <label
                                    className='text-sm font-medium text-gray-900 dark:text-gray-300'
                                    htmlFor='email'
                                >
                                    Email
                                </label>
                            </div>

                            <div className='flex'>
                                <div className='relative w-full'>
                                    <div className='flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            viewBox='0 0 24 24'
                                            fill='currentColor'
                                            className='w-6 h-6'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M17.834 6.166a8.25 8.25 0 100 11.668.75.75 0 011.06 1.06c-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788 3.807-3.808 9.98-3.808 13.788 0A9.722 9.722 0 0121.75 12c0 .975-.296 1.887-.809 2.571-.514.685-1.28 1.179-2.191 1.179-.904 0-1.666-.487-2.18-1.164a5.25 5.25 0 11-.82-6.26V8.25a.75.75 0 011.5 0V12c0 .682.208 1.27.509 1.671.3.401.659.579.991.579.332 0 .69-.178.991-.579.3-.4.509-.99.509-1.671a8.222 8.222 0 00-2.416-5.834zM15.75 12a3.75 3.75 0 10-7.5 0 3.75 3.75 0 007.5 0z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        className={
                                            actionData?.fieldErrors?.email
                                                ? error
                                                : normal
                                        }
                                        id='email'
                                        type='text'
                                        name='email'
                                        placeholder='name@domain'
                                        defaultValue={
                                            actionData?.fields?.email &&
                                            actionData?.fields?.email
                                        }
                                    />
                                </div>
                            </div>
                            <p className='mt-2 text-sm text-red-600 dark:text-red-500'>
                                {actionData?.fieldErrors?.email &&
                                    actionData?.fieldErrors?.email}
                            </p>
                        </div>
                    )}
                    <div>
                        <div className='mb-2 block'>
                            <label
                                className='text-sm font-medium text-gray-900 dark:text-gray-300'
                                htmlFor='password'
                            >
                                Password
                            </label>
                        </div>
                        <div className='flex'>
                            <div className='relative w-full'>
                                <div className='flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth={1.5}
                                        stroke='currentColor'
                                        className='w-6 h-6'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z'
                                        />
                                    </svg>
                                </div>
                                <input
                                    className={
                                        actionData?.fieldErrors?.password
                                            ? error
                                            : normal
                                    }
                                    id='password'
                                    name='password'
                                    type='password'
                                    placeholder='***********'
                                    defaultValue={
                                        actionData?.fields?.password &&
                                        actionData?.fields?.password
                                    }
                                />
                            </div>
                        </div>
                        <p className='mt-2 text-sm text-red-600 dark:text-red-500'>
                            {actionData?.fieldErrors?.password &&
                                actionData?.fieldErrors?.password}
                        </p>
                    </div>
                    {!isSigninSelected && (
                        <div>
                            <div className='mb-2 block'>
                                <label
                                    className='text-sm font-medium text-gray-900 dark:text-gray-300'
                                    htmlFor='password1'
                                >
                                    Verify password
                                </label>
                            </div>

                            <div className='flex'>
                                <div className='relative w-full'>
                                    <div className='flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none'>
                                        <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            viewBox='0 0 24 24'
                                            fill='currentColor'
                                            className='w-6 h-6'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        className={
                                            actionData?.fieldErrors?.password1
                                                ? error
                                                : normal
                                        }
                                        id='password1'
                                        type='password'
                                        name='password1'
                                        placeholder='***********'
                                        defaultValue={
                                            actionData?.fields?.password1 &&
                                            actionData?.fields?.password1
                                        }
                                    />
                                </div>
                            </div>
                            <p className='mt-2 text-sm text-red-600 dark:text-red-500'>
                                {actionData?.fieldErrors?.password1 &&
                                    actionData?.fieldErrors?.password1}
                            </p>
                        </div>
                    )}

                    <Button type='submit'>Sign in</Button>
                </form>
            </div>
        </div>
    );
}
