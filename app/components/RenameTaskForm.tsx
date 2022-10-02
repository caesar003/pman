import {Form} from '@remix-run/react';
import UpdateInput from './UpdateInput';
const RenameTaskForm = ({inputInfo, dispatch, taskName, errorMsg}) => {
    return (
        <div className='flex'>
            <Form method='post' style={{display: 'inline'}}>
                <UpdateInput
                    obKey={inputInfo.obKey}
                    taskId={inputInfo.taskId}
                    projectId={inputInfo.projectId}
                    userId={inputInfo.userId}
                    prevValue={inputInfo.prevValue}
                />
                <input
                    autoFocus={true}
                    onBlur={() =>
                        dispatch({
                            type: 'initRenameTask',
                            id: '',
                        })
                    }
                    type='text'
                    className='border-0 px-2 py-0.5 focus:border-0 focus:outline-0 focus:ring-0'
                    name='inputValue'
                    defaultValue={taskName}
                />
                <span className='px-2 text-sm text-red-600'>{errorMsg}</span>
            </Form>
        </div>
    );
};

export default RenameTaskForm;
