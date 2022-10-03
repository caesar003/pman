import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Form} from '@remix-run/react';
import UpdateInput from './UpdateInput';

const DropdownButtons = ({params}) => {
    const {
        classes,
        fn,
        fnPar,
        icon,
        Ref,
        obKey,
        projectId,
        prevValue,
        userId,
        task,
        compState,
        items,
    } = params;
    return (
        <div className='mr-2 ml-1 px-1 relative'>
            <button
                title=''
                className={classes.buttonTrigger}
                onClick={() => fn(fnPar)}
            >
                <FontAwesomeIcon icon={icon} />
            </button>
            {compState && (
                <div
                    className={`${classes.buttonsContainer} border z-10 w-[200px] bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600`}
                    ref={Ref}
                >
                    <ul className='p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200'>
                        {items.map((item) => (
                            <li key={item.elClass}>
                                <Form method='post'>
                                    <UpdateInput
                                        obKey={obKey}
                                        taskId={task.id}
                                        projectId={projectId}
                                        userId={userId}
                                        prevValue={prevValue}
                                    />
                                    <input
                                        type='hidden'
                                        name='inputValue'
                                        value={item.elClass}
                                    />
                                    <button
                                        type='submit'
                                        className='flex p-2 w-full rounded hover:bg-gray-100 dark:hover:bg-gray-600'
                                    >
                                        <div className='flex items-center h-5'>
                                            <div
                                                className={`${classes.buttons} ${item.elClass}`}
                                            >
                                                <FontAwesomeIcon icon={icon} />
                                            </div>
                                        </div>
                                        <div className='ml-2 text-sm'>
                                            <div className='font-medium text-gray-9000 dark-text-gray-300'>
                                                {item.elClass}
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

export default DropdownButtons;
