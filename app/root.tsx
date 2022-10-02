import type {MetaFunction} from '@remix-run/node';
import styles from './styles/app.css';
import {
    Link,
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useLocation,
} from '@remix-run/react';
import {faList12} from '@fortawesome/free-solid-svg-icons';
import {Navbar, Dropdown, Avatar, Badge} from 'flowbite-react';
import {getUser} from './utils/session.server';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'New Remix App',
    viewport: 'width=device-width,initial-scale=1',
});

export const links = () => {
    return [{rel: 'stylesheet', href: styles}];
};

export const loader = async ({request}) => {
    const user = await getUser(request);
    const data = {user};
    return data;
};

export default function App() {
    return (
        <Document>
            <Layout>
                <Outlet />
            </Layout>
        </Document>
    );
}

function Document({children}) {
    return (
        <html lang='en-us'>
            <head>
                <Meta />
                <Links />
                <title>Project</title>
            </head>
            <body>
                {children}
                <LiveReload />
                <Scripts />
            </body>
        </html>
    );
}

function Layout({children}) {
    const {user} = useLoaderData();
    const currentRoute = useLocation().pathname;
    return (
        <div className='mx-auto p-2 xl:mx-8'>
            {user && (
                <Navbar fluid={true} rounded={true}>
                    <Navbar.Brand href='/'>
                        <FontAwesomeIcon icon={faList12} size={'lg'} />
                        <span className='ml-2 self-center whitespace-nowrap text-xl font-semibold dark:text-white'>
                            Pman
                        </span>
                    </Navbar.Brand>
                    <div className='flex md:order-2'>
                        <Dropdown
                            arrowIcon={false}
                            inline={true}
                            label={<Avatar rounded={true} />}
                        >
                            <Dropdown.Header>
                                <span className='block text-sm'>
                                    {user.username}
                                </span>
                            </Dropdown.Header>
                            <Dropdown.Divider />
                            <Dropdown.Item>
                                <form action='auth/signout' method='post'>
                                    <button type='submit'>Sign out</button>
                                </form>
                            </Dropdown.Item>
                        </Dropdown>
                        <Navbar.Toggle />
                    </div>
                    <Navbar.Collapse>
                        <Navbar.Link href='/' active={currentRoute === '/'}>
                            Home
                        </Navbar.Link>
                        <Navbar.Link
                            href='/about'
                            active={currentRoute === '/about'}
                        >
                            About
                        </Navbar.Link>
                        <Navbar.Link
                            href='/projects'
                            active={currentRoute === '/projects'}
                        >
                            Projects
                        </Navbar.Link>
                    </Navbar.Collapse>
                </Navbar>
            )}

            <div className='px-3 py-2.5 mx-auto'>{children}</div>
        </div>
    );
}
