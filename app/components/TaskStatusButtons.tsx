import {Form} from '@remix-run/react';
import UpdateInput from './UpdateInput';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSquare} from '@fortawesome/free-solid-svg-icons';

const TaskStatusButtons = ({Ref, taskStatus, inputInfo}) => {
    return (
        <div
            className='z-10 w-60 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600'
            ref={Ref}
            style={{
                position: 'absolute',
                inset: '0px auto auto 0px',
                margin: 0,
                transform: 'translate(0px, 20px)',
            }}
        >
            <ul className='p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200'>
                {taskStatus.map((status) => (
                    <li key={status.status}>
                        <Form method='post'>
                            <UpdateInput
                                obKey={inputInfo.obKey}
                                taskId={inputInfo.taskId}
                                projectId={inputInfo.projectId}
                                userId={inputInfo.userId}
                                prevValue={inputInfo.prevValue}
                            />
                            <input
                                type='hidden'
                                name='inputValue'
                                value={status.status}
                            />
                            <button
                                type='submit'
                                className='flex p-2 w-full rounded hover:bg-gray-100 dark:hover:bg-gray-600'
                            >
                                <div className='flex items-center h-5'>
                                    <div className={`${status.status}  `}>
                                        <FontAwesomeIcon icon={faSquare} />
                                    </div>
                                </div>
                                <div className='ml-2 text-sm'>
                                    <div className='font-medium text-gray-900 dark:text-gray-300'>
                                        {status.status}
                                    </div>
                                </div>
                            </button>
                        </Form>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskStatusButtons;
