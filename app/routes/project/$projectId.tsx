import {json, redirect} from '@remix-run/node';
import {HiInformationCircle, HiPlus} from 'react-icons/hi';
import {
    Form,
    useActionData,
    useLoaderData,
    useSubmit,
    useTransition,
} from '@remix-run/react';
import {Alert, Button, Modal} from 'flowbite-react';

import React, {useEffect, useReducer, useRef, useState} from 'react';
import {db} from '~/utils/db.server';
import {getUser} from '~/utils/session.server';
import UpdateInput from '~/components/UpdateInput';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faSquare,
    faPencilAlt,
    faTrashAlt,
    faFlag,
    faFileCsv,
} from '@fortawesome/free-solid-svg-icons';

import helpers from '~/utils/helpers';
import PriorityButtons from '~/components/PriorityButtons';
import RenameTaskForm from '~/components/RenameTaskForm';
import NewTaskForm from '~/components/NewTaskForm';
import DatePicker from '~/components/DatePicker';
import TaskStatus from '~/components/TaskStatus';
import DropdownButtons from '~/components/DropdownButtons';
const {taskStatus, taskPriorities, formatDate, isValidDate, csvDataGenerator} =
    helpers;

export const loader = async ({params, request}) => {
    const user = await getUser(request);
    if (!user) return redirect('/auth/signin');
    const {projectId} = params;
    const data = {
        project: await db.project.findUnique({
            where: {id: projectId},

            include: {
                user: {
                    select: {username: true},
                },
                task: true,
            },
        }),
    };
    if (!data.project) return redirect('/notfound');
    return data;
};

const badRequest = (data) => json(data, {status: 400});

export const action = async ({request}) => {
    const form = await request.formData();

    const userId = form.get('userId');
    const projectId = form.get('projectId');
    const requestType = form.get('requestType');
    let res = {status: 400, message: 'Something went wrong', task: {}, log: {}};

    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            name: true,
            task: true,
        },
    });
    const fieldErrors = {
        name: '',
        due: '',
    };
    const log = {
        activity: '',
        projectId,
        taskId: null,
        userId,
        note: '',
    };
    switch (requestType) {
        case 'createTask': {
            const name = form.get('taskName');
            const data = {
                name,
                userId,
                status: 'todo',
                projectId,
            };
            const fields = {
                name: '',
            };
            if (!name || name.trim().length < 5 || typeof name !== 'string') {
                fieldErrors.name = 'Please write at least five characters!';
                fields.name = name;
                return badRequest({fieldErrors, fields});
            }

            res.task = await db.task.create({
                data: data,
            });
            if (res.task) {
                log.activity = 'create task';
                log.taskId = res.task.id;
                log.note = JSON.stringify({
                    taskName: name,
                    projectName: project.name,
                });
                res.log = await db.log.create({
                    data: log,
                });
            }

            res.status = 200;
            res.message = 'Data added successfully!';
            return res;
        }

        case 'updateTask': {
            const obj = {};
            /**
             * We only allow updating one single field at the time but we definitely
             * wouldn't bother to write individual functions for each one of them
             * so we create an empty object to start with, then we pass 'key' and
             * 'value' respectively
             */

            // There are four possible keys: name, priority, status, due
            const key = form.get('key');
            const inputValue = form.get('inputValue');
            const taskId = form.get('taskId');
            const prevValue = form.get('prevValue');

            const task = project.task.find((m) => m.id === taskId);
            log.taskId = taskId;
            // log.activity = 'update task';

            obj[key] = key === 'due' ? new Date(inputValue) : inputValue;
            /**
             * This will create something like,  obj = {name: "Task 1"}, and convert
             * it to javascript object if its is a date.
             */

            const fields = {
                name: '',
                due: '',
                taskId,
            };

            /**
             * Perform several validations for name and date regarding empty input,
             * or some other logging info for the rest
             */

            switch (key) {
                case 'due': {
                    if (!isValidDate(inputValue)) {
                        fieldErrors.due = 'Please enter a date!';
                        fields.due = inputValue;
                        return badRequest({fieldErrors, fields});
                    }
                    log.activity = 'set due';
                    log.note = JSON.stringify({
                        due: inputValue,
                        taskName: task.name,
                        projectName: project.name,
                    });
                    break;
                }
                case 'name': {
                    if (
                        !inputValue ||
                        inputValue.trim().length < 5 ||
                        typeof inputValue !== 'string'
                    ) {
                        fieldErrors.name =
                            'Please write at least five characters!';
                        return badRequest({fieldErrors, fields});
                    }
                    log.activity = 'rename task';
                    log.note = JSON.stringify({
                        oldName: prevValue,
                        newName: inputValue,
                        projectName: project.name,
                    });
                    break;
                }
                case 'priority': {
                    log.activity = 'set priority';
                    log.note = JSON.stringify({
                        priority: inputValue,
                        taskName: task.name,
                        projectName: project.name,
                    });
                    break;
                }
                case 'status': {
                    log.activity = 'change status';
                    log.note = JSON.stringify({
                        status: inputValue,
                        taskName: task.name,
                        projectName: project.name,
                    });
                    break;
                }
            }

            // Up to this point, no error happens, proceed to submission

            res.task = await db.task.update({
                data: obj,
                where: {
                    id: taskId,
                },
            });

            if (res.task) {
                res.log = await db.log.create({
                    data: log,
                });
            }

            res.message = 'Task updated';
            res.status = 200;
            return res;
        }

        case 'deleteTask': {
            const id = form.get('taskId');
            const task = project?.task.find((m) => m.id === id);

            res.task = await db.task.delete({
                where: {id},
            });

            log.activity = 'delete task';
            log.note = JSON.stringify({
                taskName: task?.name,
                projectName: project?.name,
            });
            if (res.task)
                res.log = await db.log.create({
                    data: log,
                });
            res.status = 200;
            res.message = 'Task deleted';
            return res;
        }
        default:
            break;
    }

    return res;
};

export default function ProjectId() {
    const actionData = useActionData();
    const transition = useTransition();
    const {project} = useLoaderData();

    const csvData = csvDataGenerator(project, formatDate);

    const downloadReport = () => {
        const el = document.createElement('a');
        const file = new Blob([csvData], {type: 'text/plain;charset=utf-8'});
        el.href = URL.createObjectURL(file);
        el.download = project.name + '.csv';
        document.body.appendChild(el);
        el.click();
    };
    const {
        id,
        name,
        description,
        createdAt,
        updatedAt,
        userId,
        user,
        task: tasks,
    } = project;

    const initialState = {
        isRenamingTask: false,
        taskId: null,
        actionData,
        deleteModalOpen: false,
        isUpdatingTaskStatus: false,
        taskButtonVisible: false,
        taskStatusButtonsShown: false,
        taskPriorityButtonsShown: false,
        taskEditorButtonsShown: false,
        taskRenameInputShown: !!actionData?.fieldErrors?.name || false,
        updateTaskDueShown: !!actionData?.fieldErrors?.due || false,
        newTaskInputShown: !!actionData?.fieldErrors?.name || false,
        deleteTaskModalShown: false,
        ids: {
            delete: null,
            update:
                actionData?.fieldErrors?.due || actionData?.fieldErrors?.name
                    ? actionData.fields.taskId
                    : null,
            rename: null,
            taskButton: null,
        },
    };
    const reducer = (state, action) => {
        const obj = Object.assign({}, state);

        switch (action.type) {
            case 'renameTaskInit': {
                obj.isRenamingTask = true;
                obj.ids.rename = action.id;

                return obj;
            }

            case 'openModal': {
                obj.ids.delete = action.id;
                obj.deleteModalOpen = true;
                return obj;
            }
            case 'closeModal': {
                obj.deleteModalOpen = false;
                return obj;
            }
            case 'showNewTaskInput': {
                obj.newTaskInputShown = true;
                return obj;
            }
            case 'hideNewTaskInput': {
                obj.newTaskInputShown = false;
                return obj;
            }
            case 'showTaskStatusButtons': {
                obj.taskStatusButtonsShown = !state.taskStatusButtonsShown;
                obj.ids.update = action.id || null;

                return obj;
            }
            case 'showTaskPriorityButtons': {
                obj.taskPriorityButtonsShown = !state.taskPriorityButtonsShown;
                obj.ids.update = action.id || null;
                return obj;
            }
            case 'initRenameTask': {
                if (!action.id) {
                    obj.taskRenameInputShown = false;
                    obj.ids.update = null;
                } else {
                    obj.taskRenameInputShown = true;
                    obj.ids.update = action.id || null;
                }
                return obj;
            }
            case 'showUpdateTaskDue': {
                obj.updateTaskDueShown = !state.updateTaskDueShown;
                obj.ids.update = action.id || null;
                return obj;
            }
            case 'openDeleteTaskModal': {
                obj.deleteTaskModalShown = !state.deleteTaskModalShown;
                obj.ids.delete = action.id || null;
                return obj;
            }
            case 'hideTaskStatusButtons': {
                obj.taskStatusButtonsShown = false;
                obj.ids.update = null;
                return obj;
            }
            case 'showTaskEditorButtons': {
                obj.taskEditorButtonsShown = !state.taskEditorButtonsShown;
                obj.ids.update = action.id;
                return obj;
            }
            case 'reset': {
                return initialState;
            }
            default: {
                return state;
            }
        }
    };

    const [state, dispatch] = useReducer(reducer, initialState);

    const inputRef = useRef(null);
    const taskButtonRef = useRef(null);
    const taskPriorityButtonRef = useRef(null);
    const dueFormRef = useRef(null);
    const renameTaskRef = useRef(null);
    const isSubmitting = transition.state === 'submitting';

    const submit = useSubmit();

    const updateDue = (event) => {
        submit(event.currentTarget, {replace: true});
    };
    useEffect(() => {
        if (isSubmitting) {
            dispatch({
                type: 'reset',
            });
            inputRef.current?.value ? (inputRef.current.value = '') : null;
            inputRef.current?.blur();
        }
        // state.
        if (state.taskStatusButtonsShown) {
            const listener = (event) => {
                if (
                    !taskButtonRef.current ||
                    taskButtonRef.current.contains(event.target)
                ) {
                    return;
                }

                dispatch({
                    type: 'showTaskStatusButtons',
                    id: null,
                });
            };
            document.addEventListener('mousedown', listener);
            document.addEventListener('touchstart', listener);

            return () => {
                document.removeEventListener('mousedown', listener);
                document.removeEventListener('touchstart', listener);
            };
        }
        if (state.taskPriorityButtonsShown) {
            const listener = (event) => {
                if (
                    !taskPriorityButtonRef.current ||
                    taskPriorityButtonRef.current.contains(event.target)
                ) {
                    return;
                }

                dispatch({
                    type: 'showTaskPriorityButtons',
                    id: null,
                });
            };
            document.addEventListener('mousedown', listener);
            document.addEventListener('touchstart', listener);

            return () => {
                document.removeEventListener('mousedown', listener);
                document.removeEventListener('touchstart', listener);
            };
        }
        // if (state.updateTaskDueShown) {
        //     const listener = (event) => {
        //         if (
        //             !dueFormRef.current ||
        //             dueFormRef.current.contains(event.target)
        //         ) {
        //             return;
        //         }

        //         dispatch({
        //             type: 'showUpdateTaskDue',
        //             id: null,
        //         });
        //     };
        //     document.addEventListener('mousedown', listener);
        //     document.addEventListener('touchstart', listener);

        //     return () => {
        //         document.removeEventListener('mousedown', listener);
        //         document.removeEventListener('touchstart', listener);
        //     };
        // }
    }, [isSubmitting, state]);
    return (
        <>
            <div className='md:grid md:grid-cols-12 gap-4 '>
                <div className='mb-2 md:mb-0 col-span-4 '>
                    <h1 className='text-[26px]'>{name}</h1>
                    <p className='text-gray-600 italic'>
                        By {user.username}, {formatDate(createdAt)}
                    </p>
                    <p>{description}</p>
                </div>
                <div className='col-span-8 '>
                    <div id='taskContainer'>
                        {tasks.map((task, idx) => (
                            <div
                                key={task.id}
                                className={`grid grid-cols-12 gap-4 mb-2 ${
                                    idx % 2 === 0 ? '' : 'bg-gray-100'
                                } `}
                            >
                                <div className='col-span-7 flex justify-start'>
                                    {/* TASK STATUS BUTTON */}
                                    {/* <TaskStatus
                                        params={{
                                            task,
                                            taskStatus,
                                            obKey: 'status',
                                            taskId: task.id,
                                            projectId: id,
                                            userId,
                                            prevValue: task.status,
                                            Ref: taskButtonRef,
                                            compState:
                                                state.taskStatusButtonsShown &&
                                                state.ids.update === task.id,
                                            fn: dispatch,
                                            fnPar: {
                                                type: 'showTaskStatusButtons',
                                                id: task.id,
                                            },
                                        }}
                                    /> */}
                                    <DropdownButtons
                                        params={{
                                            icon: faSquare,
                                            fn: dispatch,
                                            fnPar: {
                                                type: 'showTaskStatusButtons',
                                                id: task.id,
                                            },
                                            Ref: taskButtonRef,
                                            obKey: 'status',
                                            projectId: id,
                                            prevValue: task.status,
                                            userId,
                                            task,
                                            compState:
                                                state.taskStatusButtonsShown &&
                                                state.ids.update === task.id,
                                            classes: {
                                                buttonTrigger: `py-0.5 mx-1 ${task.status}`,
                                                buttonsContainer:
                                                    'status-buttons-container',
                                                buttons: '',
                                            },
                                            items: taskStatus,
                                        }}
                                    />
                                    {/* RENAME TASK FORM */}
                                    <div className=''>
                                        {!(
                                            state.taskRenameInputShown &&
                                            state.ids.update === task.id
                                        ) ? (
                                            <>
                                                <p className='border-0 px-2 py-0.5'>
                                                    {task.name}
                                                </p>
                                            </>
                                        ) : (
                                            <RenameTaskForm
                                                inputInfo={{
                                                    obKey: 'name',
                                                    taskId: task.id,
                                                    projectId: id,
                                                    userId: userId,
                                                    prevValue: task.name,
                                                }}
                                                dispatch={dispatch}
                                                taskName={task.name}
                                                errorMsg={
                                                    actionData?.fieldErrors
                                                        ?.name
                                                        ? actionData.fieldErrors
                                                              .name
                                                        : ''
                                                }
                                            />
                                        )}
                                        {/*
                                          TASK DATE INFORMATION */}

                                        <p className='text-sm px-2'>
                                            <span className='font-bold'>
                                                Added:{' '}
                                            </span>
                                            {formatDate(task.createdAt)}
                                        </p>
                                        <p className='text-sm px-2'>
                                            <button
                                                onClick={() =>
                                                    dispatch({
                                                        type: 'showUpdateTaskDue',
                                                        id: task.id,
                                                    })
                                                }
                                                className='hover:text-gray-500 text-left'
                                            >
                                                {formatDate(task.due) ? (
                                                    <>
                                                        <span
                                                            title='Due, click to change'
                                                            className='font-bold'
                                                        >
                                                            Due:{' '}
                                                        </span>
                                                        {formatDate(task.due)}
                                                    </>
                                                ) : (
                                                    <span>Set due date</span>
                                                )}
                                            </button>
                                        </p>
                                        <div className='relative'>
                                            {state.updateTaskDueShown &&
                                                state.ids.update ===
                                                    task.id && (
                                                    <div
                                                        className='z-10 w-[310px] bg-white rounded border shadow '
                                                        ref={dueFormRef}
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            inset: '0px auto auto 0px',
                                                            margin: 0,
                                                            transform:
                                                                'translate(0px, 5px)',
                                                        }}
                                                    >
                                                        <Form method='post'>
                                                            <div className='inline-flex items-center'>
                                                                <div>
                                                                    <DatePicker />
                                                                </div>
                                                                <UpdateInput
                                                                    obKey='due'
                                                                    taskId={
                                                                        task.id
                                                                    }
                                                                    userId={
                                                                        userId
                                                                    }
                                                                    projectId={
                                                                        id
                                                                    }
                                                                    prevValue={
                                                                        task.due
                                                                    }
                                                                />
                                                                <div className='ml-1 flex justify-center'>
                                                                    <button
                                                                        type='submit'
                                                                        className='text-center w-full border'
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className='ml-1 mt-1 text-sm text-red-600 dark:text-red-500'>
                                                                    {actionData
                                                                        ?.fieldErrors
                                                                        ?.due &&
                                                                        actionData
                                                                            ?.fieldErrors
                                                                            ?.due}
                                                                </p>
                                                            </div>
                                                        </Form>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-span-5 flex justify-end align-baseline'>
                                    <div className='mx-1 px-1'>
                                        <button
                                            className='text-green-400 mx-1  py-0.5'
                                            onClick={() =>
                                                dispatch({
                                                    type: 'initRenameTask',
                                                    id: task.id,
                                                })
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faPencilAlt}
                                            />
                                        </button>
                                    </div>
                                    <div className='mx-1 px-1'>
                                        <button
                                            className='text-red-400 mx-1 py-0.5'
                                            onClick={() =>
                                                dispatch({
                                                    type: 'openDeleteTaskModal',
                                                    id: task.id,
                                                })
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={faTrashAlt}
                                            />
                                        </button>
                                    </div>
                                    <DropdownButtons
                                        params={{
                                            icon: faFlag,
                                            fn: dispatch,
                                            fnPar: {
                                                type: 'showTaskPriorityButtons',
                                                id: task.id,
                                            },
                                            Ref: taskPriorityButtonRef,
                                            obKey: 'priority',
                                            projectId: id,
                                            prevValue: task.priority,
                                            userId,
                                            task,
                                            compState:
                                                state.taskPriorityButtonsShown &&
                                                state.ids.update === task.id,
                                            classes: {
                                                buttonTrigger: `py-0.5 prior ${task.priority}`,
                                                buttonsContainer:
                                                    'priority-buttons-container',
                                                buttons: 'prior',
                                            },
                                            items: taskPriorities,
                                        }}
                                    />
                                    {/* <div className='mr-2 ml-1 px-1 relative'>
                                        <button
                                            title={`Priority ${task.priority}`}
                                            className={`prior prior-${task.priority} py-0.5`}
                                            onClick={() =>
                                                dispatch({
                                                    type: 'showTaskPriorityButtons',
                                                    id: task.id,
                                                })
                                            }
                                        >
                                            <FontAwesomeIcon icon={faFlag} />
                                        </button>

                                        {state.taskPriorityButtonsShown &&
                                            state.ids.update === task.id && (
                                                <PriorityButtons
                                                    Ref={taskPriorityButtonRef}
                                                    priorities={taskPriorities}
                                                    inputInfo={{
                                                        obKey: 'priority',
                                                        taskId: task.id,
                                                        projectId: id,
                                                        prevValue:
                                                            task.priority,
                                                        userId: userId,
                                                    }}
                                                />
                                            )}
                                    </div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <button
                            className='ml-1'
                            onClick={() => downloadReport()}
                        >
                            <FontAwesomeIcon
                                icon={faFileCsv}
                                size={'lg'}
                                color='rgb(4, 108, 78)'
                            />
                            <span className='ml-1'>Export to CSV</span>
                        </button>
                    </div>
                    <div>
                        {state.newTaskInputShown ? (
                            <NewTaskForm
                                projectId={id}
                                dispatch={dispatch}
                                userId={userId}
                                defValue={
                                    actionData?.fieldErrors?.name
                                        ? actionData.fields.name
                                        : ''
                                }
                                errorMsg={
                                    actionData?.fieldErrors?.name
                                        ? actionData.fieldErrors.name
                                        : ''
                                }
                            />
                        ) : (
                            <button
                                onClick={() =>
                                    dispatch({type: 'showNewTaskInput'})
                                }
                                className='py-2 px-4 rounded inline-flex items-center'
                            >
                                <HiPlus />
                                <span>Add a task</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* DELETE TASK CONFIRMATION MODAL */}
            <React.Fragment>
                <Modal
                    show={state.deleteTaskModalShown}
                    onClose={() =>
                        dispatch({type: 'openDeleteTaskModal', id: ''})
                    }
                    size='sm'
                >
                    <Form method='post'>
                        <Modal.Header>Are you sure?</Modal.Header>
                        <Modal.Body>
                            <div className='space-y-6'>
                                <Alert
                                    color='failure'
                                    icon={HiInformationCircle}
                                >
                                    <span>
                                        <span className='font-medium'>
                                            Proceed with care!{' '}
                                        </span>{' '}
                                        This action could cause permanent data
                                        loss{' '}
                                    </span>
                                </Alert>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <input
                                type='hidden'
                                name='requestType'
                                value='deleteTask'
                            />
                            <input
                                type='hidden'
                                name='taskId'
                                value={state.ids.delete || ''}
                            />
                            <input type='hidden' name='projectId' value={id} />
                            <input type='hidden' name='userId' value={userId} />
                            <Button color='warning' type='submit'>
                                Delete
                            </Button>

                            <Button
                                color='gray'
                                onClick={() =>
                                    dispatch({
                                        type: 'openDeleteTaskModal',
                                        id: '',
                                    })
                                }
                            >
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </React.Fragment>
        </>
    );
}
