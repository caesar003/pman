import {
    Link,
    Outlet,
    useActionData,
    useLoaderData,
    useSubmit,
} from '@remix-run/react';
import {
    Button,
    Checkbox,
    Modal,
    TextInput,
    Label,
    Textarea,
    Timeline,
} from 'flowbite-react';
import helpers from '~/utils/helpers';
import {HiCalendar, HiArrowNarrowRight} from 'react-icons/hi';
import {Form} from '@remix-run/react';
import React, {useEffect, useState} from 'react';
import {getUser} from '~/utils/session.server';
import {ActionFunction, LoaderFunction, redirect} from '@remix-run/node';
import TimelineConstructor from '~/components/TimelineConstructor';
import {db} from '~/utils/db.server';
import type {Project, Task, Log} from '@prisma/client';

const {timelineConstuctor, formatDate} = helpers;

export const loader: LoaderFunction = async ({request}) => {
    const user = await getUser(request);
    if (!user) return redirect('auth/signin');
    const data = {
        projects: await db.project.findMany({
            include: {
                user: {select: {username: true}},
                task: true,
            },
        }),
        logs: await db.log.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        }),
    };
    // console.log(data);
    return data;
};

export const action: ActionFunction = async ({request}) => {
    const form = await request.formData();
    const search = form.get('search');

    // const searchResult = {query: search};
    // if (!search || search.length === 0) return searchResult;

    // console.log(search);
    const projects = await db.project.findMany({
        where: {
            // id: search,

            name: {
                contains: search,
            },
        },
    });
    const tasks = await db.task.findMany({
        where: {
            name: {
                contains: search,
            },
        },
    });
    // console.log(result);
    // searchResult.tasks = tasks;
    // searchResult.projects = projects;
    // if (!projects.length && !tasks.length) return null;
    // return searchResult;
    return projects.concat(tasks);
};

export default function IndexRoute() {
    const {projects, logs} = useLoaderData();
    const actionData = useActionData();
    const [searchResult, modifySearchResult] = useState([]);
    const [searchQuery, setQuery] = useState('');
    // console.log(actionData);

    useEffect(() => {
        modifySearchResult(actionData || []);
    }, [actionData]);
    const submitQuery = useSubmit();
    const handleSearch = (e) => {
        // passing the value to action function
        submitQuery(e.currentTarget, {replace: true});
        const search = e.target.value;
        setQuery(search);
    };
    return (
        <>
            <Form method='post' onChange={(e) => handleSearch(e)}>
                <label
                    htmlFor='default-search'
                    className='mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300'
                >
                    Search
                </label>
                <div className='flex justify-center'>
                    <div className='relative w-10/12 lg:w-1/2'>
                        <div className='flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none'>
                            <svg
                                aria-hidden='true'
                                className='w-5 h-5 text-gray-500 dark:text-gray-400'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                ></path>
                            </svg>
                        </div>
                        <input
                            type='search'
                            name='search'
                            id='default-search'
                            className='block p-4 pl-10  w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                            placeholder='Find projects, tasks'
                            required
                        />
                    </div>
                </div>
            </Form>

            <div className='mt-3 p-6'>
                {!searchQuery ? (
                    <>
                        {' '}
                        <h1 className='text-[42px] mb-2'>Your Activities</h1>
                        {logs.length ? (
                            logs.map((log: Log, i: number) => (
                                <div key={log.id}>
                                    <TimelineConstructor
                                        idx={i}
                                        log={log}
                                        project={
                                            log.projectId
                                                ? projects.find(
                                                      (m: Project) =>
                                                          m.id ===
                                                          log.projectId,
                                                  )
                                                : null
                                        }
                                    />
                                </div>
                            ))
                        ) : (
                            <div>
                                There is nothing here yet, why don't you start{' '}
                                <Link to='/projects?p=create'>
                                    creating a project
                                </Link>
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <h1 className='text-[42px] mb-2'>
                            {searchResult.length} result for{' '}
                            <em>{searchQuery}</em>
                        </h1>
                        <Timeline>
                            {searchResult.length ? (
                                searchResult.map((result) => (
                                    <Timeline.Item key={result.id}>
                                        <Timeline.Point />
                                        <Timeline.Content>
                                            <Timeline.Time>
                                                {formatDate(result.createdAt)}
                                            </Timeline.Time>
                                            <Timeline.Title>
                                                {result.name}
                                            </Timeline.Title>
                                            <Timeline.Body></Timeline.Body>
                                        </Timeline.Content>
                                    </Timeline.Item>
                                ))
                            ) : (
                                <div>
                                    There is no record matches your search
                                </div>
                            )}
                        </Timeline>
                    </div>
                )}
            </div>
        </>
    );
}

{
    /* <div className=' mt-3 p-6'>
                <h1 className='text-[42px] mb-2'>Your Activities</h1>

                {!isSearchResultShown ? (
                    logs.length ? (
                        logs.map((log, i) => (
                            <div key={log.id}>
                                <TimelineConstructor
                                    idx={i}
                                    log={log}
                                    project={
                                        log.projectId
                                            ? projects.find(
                                                  (m) => m.id === log.projectId,
                                              )
                                            : null
                                    }
                                />
                            </div>
                        ))
                    ) : (
                        <div className='mt-3 p-6'>
                            There is nothing here yet, why don't you start{' '}
                            <Link to='/projects?p=create'>
                                creating a project
                            </Link>
                        </div>
                    )
                ) : (
                    <div className='mt-3 p6'>
                        <Timeline>
                            {searchResult.map((result) => (
                                <Timeline.Item key={result.id}>
                                    <Timeline.Point />
                                    <Timeline.Content>
                                        <Timeline.Time>{formatDate(result.createdAt)}</Timeline.Time>
                                        <Timeline.Title>{result.name}</Timeline.Title>
                                        <Timeline.Body></Timeline.Body>
                                    </Timeline.Content>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </div>
                )}
            </div><Timeline.Item>
                        <Timeline.Point icon={HiCalendar} />
                        <Timeline.Content>
                            <Timeline.Time>March 2022</Timeline.Time>
                            <Timeline.Title>
                                Marketing UI design in Figma
                            </Timeline.Title>
                            <Timeline.Body>
                                All of the pages and components are first
                                designed in Figma and we keep a parity between
                                the two versions even as we update the project.
                            </Timeline.Body>
                        </Timeline.Content>
                    </Timeline.Item>
                    <Timeline.Item>
                        <Timeline.Point icon={HiCalendar} />
                        <Timeline.Content>
                            <Timeline.Time>April 2022</Timeline.Time>
                            <Timeline.Title>
                                E-Commerce UI code in Tailwind CSS
                            </Timeline.Title>
                            <Timeline.Body>
                                Get started with dozens of web components and
                                interactive elements built on top of Tailwind
                                CSS.
                            </Timeline.Body>
                        </Timeline.Content>
                    </Timeline.Item> */
}
