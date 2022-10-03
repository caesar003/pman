import {faSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Form} from '@remix-run/react';
import UpdateInput from './UpdateInput';

const TaskStatus = ({params}) => {
    const {
        taskStatus,
        task,
        obKey,
        taskId,
        projectId,
        userId,
        prevValue,
        Ref,
        compState,
        fn,
        fnPar,
        State,
    } = params;
    return (
        <div className='mx-1 px-1 relative'>
            <button
                title='Task status'
                className={`mx-1 py-0.5 ${task.status}`}
                onClick={() => fn(fnPar)}
            >
                <FontAwesomeIcon icon={faSquare} />
            </button>
            {compState && (
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
                                        obKey={obKey}
                                        taskId={taskId}
                                        projectId={projectId}
                                        userId={userId}
                                        prevValue={prevValue}
                                    />
                                    <input
                                        type='hidden'
                                        name='inputValue'
                                        value={status.status}
                                    />
                                    <button
                                        type='submit'
                                        className='flex p-2 w-full rounded hover:bg-gray-100'
                                    >
                                        <div className='flex items-center h-5'>
                                            <div className={`${status.status}`}>
                                                <FontAwesomeIcon
                                                    icon={faSquare}
                                                />{' '}
                                            </div>
                                        </div>
                                        <div className='ml-2 text-sm'>
                                            <div className='font-medium text-gray-900 '>
                                                {status.status}
                                            </div>
                                        </div>
                                    </button>
                                </Form>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
export default TaskStatus;
