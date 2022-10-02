import {Form} from '@remix-run/react';

const NewTaskForm = ({projectId, userId, dispatch, errorMsg, defValue}) => {
    return (
        <Form method='post'>
            <div>
                <input type='hidden' name='requestType' value='createTask' />
                <input type='hidden' name='projectId' value={projectId} />
                <input type='hidden' name='userId' value={userId} />
                <input
                    autoFocus={true}
                    onBlur={() => dispatch({type: 'hideNewTaskInput', id: ''})}
                    className='w-full rounded'
                    type='text'
                    name='taskName'
                    defaultValue={defValue}
                />
            </div>
            <div>
                <p className='px-2 text-sm text-red-600'>{errorMsg}</p>
            </div>
        </Form>
    );
};

export default NewTaskForm;
