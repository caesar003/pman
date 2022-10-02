const UpdateInput = ({obKey, taskId, projectId, userId, prevValue}) => (
    <>
        <input type='hidden' name='requestType' value='updateTask' />
        <input type='hidden' name='key' value={obKey} />
        <input type='hidden' name='taskId' value={taskId} />
        <input type='hidden' name='userId' value={userId} />
        <input type='hidden' name='projectId' value={projectId} />
        <input type='hidden' name='prevValue' value={prevValue} />
    </>
);

export default UpdateInput;
