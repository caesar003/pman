import {Form} from '@remix-run/react';
import UpdateInput from './UpdateInput';
import { capitalize } from '~/utils/helpers';
import {HiFlag} from 'react-icons/hi';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFlag} from '@fortawesome/free-solid-svg-icons';
const PriorityButtons = ({priorities, inputInfo, Ref}) => (
    <div
        ref={Ref}
        style={{
            position: 'absolute',
            inset: '0px auto auto 0px',
            margin: 0,
            left: -160,
            top: 30,
        }}
        className='border z-10 w-[200px] bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600'
    >
        <ul className='p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200'>
            {priorities.map((priority) => (
                <li key={priority.prior}>
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
                            value={priority.prior}
                        />
                        <button
                            type='submit'
                            className='flex p-2 w-full rounded hover:bg-gray-100 dark:hover:bg-gray-600'
                        >
                            <div className='flex items-center h-5'>
                                <div
                                    className={`prior prior-${priority.prior}`}
                                >
                                    <FontAwesomeIcon icon={faFlag} />
                                </div>
                            </div>
                            <div className='ml-2 text-sm'>
                                <div className='font-medium text-gray-900 dark:text-gray-300'>
                                    {capitalize(priority.prior)} priority
                                </div>
                            </div>
                        </button>
                    </Form>
                </li>
            ))}
        </ul>
    </div>
);

export default PriorityButtons;
