import {
    Form,
    Link,
    useActionData,
    useLoaderData,
    useParams,
    useSearchParams,
} from '@remix-run/react';
import {
    Button,
    Checkbox,
    Modal,
    TextInput,
    Label,
    Textarea,
} from 'flowbite-react';
import {db} from '~/utils/db.server';
import React, {useState} from 'react';
import {getUser} from '~/utils/session.server';
import {ActionFunction, json, LoaderFunction, redirect} from '@remix-run/node';
import {Project, Log} from '@prisma/client';

export const loader: LoaderFunction = async ({request}) => {
    const user = await getUser(request);
    if (!user) return redirect('auth/signin');

    const projects = await db.project.findMany({
        include: {
            user: true,
        },
        where: {
            userId: user.id,
        },
    });
    const data = {projects, user};
    return data;
};
const inputClasses = {
    textarea:
        'block w-full rounded-lg border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500',
    valid: 'block p-4  w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500',
    invalid:
        'block p-4  w-full text-sm text-red-900 bg-red-50 rounded-lg border border-red-500 focus:ring-red-500 focus:border-red-500 dark:bg-red-700 dark:border-red-600 dark:placeholder-red-400 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500',
};
const validateForm = ({name, description}) => {
    // return null;

    const obj = {
        name: '',
        description: '',
    };

    if (!name || name.length === 0 || typeof name !== 'string')
        obj.name = 'This field is required';
    if (name && name.trim().length < 5)
        obj.name = 'Project must contain at least five characters!';

    if (
        !description ||
        description.length === 0 ||
        typeof description !== 'string'
    )
        obj.description = 'This field is required';
    if (description && description.trim().length < 10)
        obj.description = 'Write at least ten characters in this field!';
    return obj;
};

const badRequest = (data) => json(data, {status: 400});
export const action: ActionFunction = async ({request}) => {
    const {id: userId} = await getUser(request);
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const isPrivate = formData.get('isPrivate');

    const fields: {
        name: FormDataEntryValue | null;
        description: FormDataEntryValue | null;
    } = {
        name,
        description,
    };

    const fieldErrors = validateForm(fields);

    if (Object.values(fieldErrors).some(Boolean)) {
        return badRequest({fieldErrors, fields});
    }
    fields.name = name;
    fields.userId = userId;
    fields.isPrivate = !!isPrivate;

    const project = await db.project.create({data: fields});

    const log: Log = {
        projectId: project.id,
        activity: 'create project',
        userId,
        note: name,
    };
    if (project)
        await db.log.create({
            data: log,
        });
    return redirect(`/project/${project.id}`);
};

export default function IndexRoute() {
    const [searchParam, setSearchParam] = useSearchParams();
    const createProjectfromParams = searchParam.get('p');
    const actionData = useActionData();
    const {projects} = useLoaderData();
    const [isProjectModalShown, showModal] = useState(
        actionData?.fieldErrors || !!createProjectfromParams,
    );
    const {valid, invalid} = inputClasses;
    return (
        <>
            {/* <Form>
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
                            id='default-search'
                            className='block p-4 pl-10  w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                            placeholder='Find projects, tasks'
                            required
                        />
                        <button
                            type='submit'
                            className='text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
                        >
                            Search
                        </button>
                    </div>
                </div>
            </Form> */}
            <div className='mb-3 mt-6 flex justify-between flex-col md:flex-row'>
                <h1 className='font-bold text-4xl'>Your projects</h1>
                {/* <Button onClick={() => showModal(true)}>Create New</Button> */}
            </div>
            <div className='grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4'>
                {projects.map((project: Project) => (
                    <div
                        key={project.id}
                        className='rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-3'
                    >
                        <h5 className='text-[25.9px] font-[500] tracking-tight text-gray-900 dark:text-white'>
                            {project.name}
                        </h5>
                        <p className='font-normal text-[16px] text-gray-700 dark:text-gray-400'>
                            {project.description.substr(0, 60)} ...
                            <Link to={`/project/${project.id}`}>
                                <em>read more</em>
                            </Link>
                        </p>
                    </div>
                ))}
                <div className='rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 p-3'>
                    <h5 className='text-[25.9px] font-[500] tracking-tight text-gray-900 dark:text-white'>
                        Create New
                    </h5>
                    <div className=' text-center'>
                        <button
                            className='hover:bg-blue-200 p-4 rounded-md'
                            onClick={() => showModal(true)}
                        >
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
                                    d='M12 4.5v15m7.5-7.5h-15'
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <React.Fragment>
                    <Modal
                        show={isProjectModalShown}
                        size='md'
                        popup={true}
                        onClose={() => showModal(false)}
                    >
                        <Modal.Header />
                        <Modal.Body>
                            <Form method='post'>
                                <div className='space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8'>
                                    <h3 className='text-xl font-medium text-gray-900 dark:text-white'>
                                        Write your ideas and start working!
                                    </h3>
                                    <div>
                                        <div className='mb-2 block'>
                                            <label
                                                className='text-sm font-medium text-gray-900 dark:text-gray-300'
                                                htmlFor='name'
                                            >
                                                Project title
                                            </label>
                                        </div>
                                        <div className='flex'>
                                            <div className='relative w-full'>
                                                <input
                                                    className={
                                                        actionData?.fieldErrors
                                                            ?.name
                                                            ? invalid
                                                            : valid
                                                    }
                                                    id='name'
                                                    name='name'
                                                    placeholder='What do you want to call it?'
                                                    defaultValue={
                                                        actionData?.fields
                                                            ?.name &&
                                                        actionData?.fields?.name
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <p className='mt-2 text-sm text-red-600 dark:text-red-500'>
                                            {actionData?.fieldErrors?.name &&
                                                actionData?.fieldErrors?.name}
                                        </p>
                                    </div>

                                    <div>
                                        <div className='mb-2 block'>
                                            <label
                                                className='text-sm font-medium text-gray-900 dark:text-gray-300'
                                                htmlFor='projectDescription'
                                            >
                                                Description
                                            </label>
                                        </div>
                                        <textarea
                                            className={
                                                actionData?.fieldErrors
                                                    ?.description
                                                    ? invalid
                                                    : valid
                                            }
                                            name='description'
                                            id='description'
                                            rows={6}
                                            defaultValue={
                                                actionData?.fields?.name &&
                                                actionData?.fields?.name
                                            }
                                            placeholder='Describe a bit about it...'
                                        ></textarea>
                                        <p className='mt-2 text-sm text-red-600 dark:text-red-500'>
                                            {actionData?.fieldErrors
                                                ?.description &&
                                                actionData?.fieldErrors
                                                    ?.description}
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Checkbox
                                            name='isPrivate'
                                            id='isPrivate'
                                        />
                                        <Label htmlFor='isPrivate'>
                                            Make the project private
                                        </Label>
                                    </div>
                                    <div className='w-full'>
                                        <Button type='submit'>Save</Button>
                                    </div>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </React.Fragment>
            </div>
        </>
    );
}
