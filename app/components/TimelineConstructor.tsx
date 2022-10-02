import {Button, Timeline} from 'flowbite-react';
import {Link} from '@remix-run/react';
import {HiCalendar, HiArrowNarrowRight} from 'react-icons/hi';
import helpers from '~/utils/helpers';
const {formatDate} = helpers;
export default function TimelineConstructor({log, project, idx}) {
    const {
        activity,
        createdAt,
        id,
        note,
        projectId,
        taskId,
        updatedAt,
        userId,
    } = log;

    const obj = {
        title: null,
        time: formatDate(createdAt),
        body: null,
        link: `/project/${projectId}`,
    };
    switch (activity) {
        case 'create project': {
            obj.title = (
                <Timeline.Title>
                    You created <em>{project.name}</em> project
                </Timeline.Title>
            );
            break;
        }
        case 'rename project': {
            console.log('renaming a project');
            break;
        }
        case 'delete project': {
            console.log('deleting a project');
            break;
        }
        case 'edit description': {
            console.log('editing project description');
            break;
        }
        case 'create task': {
            const {taskName, projectName} = JSON.parse(log.note);
            obj.title = (
                <Timeline.Title>
                    You added new task on <em>{projectName}</em>
                </Timeline.Title>
            );
            obj.body = (
                <Timeline.Body>
                    <em>{taskName}</em>
                </Timeline.Body>
            );
            break;
        }
        case 'rename task': {
            const {oldName, newName} = JSON.parse(note);
            obj.title = (
                <Timeline.Title>
                    You renamed a task on <em>{project.name}</em>
                </Timeline.Title>
            );
            obj.body = (
                <Timeline.Body>
                    You modified <em>{oldName}</em> to <em> {newName}</em>
                </Timeline.Body>
            );
            break;
        }
        case 'set due': {
            const {taskName, due, projectName} = JSON.parse(log.note);
            obj.title = (
                <Timeline.Title>
                    You set due date for a task on <em>{projectName}</em>
                </Timeline.Title>
            );
            obj.body = (
                <Timeline.Body>
                    You set <em>{taskName}</em> to finish by
                    <em> {formatDate(due)}</em>
                </Timeline.Body>
            );
            break;
        }
        case 'set priority': {
            const {priority, taskName, projectName} = JSON.parse(log.note);
            obj.title = (
                <Timeline.Title>
                    You changed priority of a task on <em>{projectName}</em>
                </Timeline.Title>
            );
            obj.body = (
                <Timeline.Body>
                    Priority of <em>{taskName} </em> was set to{' '}
                    <em>{priority}</em>
                </Timeline.Body>
            );
            break;
        }

        case 'change status': {
            const {status, taskName, projectName} = JSON.parse(note);
            switch (status) {
                case 'ongoing':
                    obj.title = (
                        <Timeline.Title>
                            You started working on a task on{' '}
                            <em>{projectName} </em>
                        </Timeline.Title>
                    );
                    break;
                case 'done':
                    obj.title = (
                        <Timeline.Title>
                            You finished a task on <em>{projectName}</em>
                        </Timeline.Title>
                    );
                    break;

                case 'todo':
                    obj.title = (
                        <Timeline.Title>
                            You changed the status of a task on{' '}
                            <em>{projectName}</em>
                        </Timeline.Title>
                    );
                    break;
            }
            obj.body = (
                <Timeline.Body>
                    <em>{taskName}</em> status was set to <em>{status}</em>
                </Timeline.Body>
            );

            break;
        }
        case 'delete task': {
            const {taskName, projectName} = JSON.parse(log.note);
            obj.title = (
                <Timeline.Title>
                    You removed a task from <em>{projectName}</em>
                </Timeline.Title>
            );
            obj.body = (
                <Timeline.Body>
                    <em>{taskName}</em> was removed.
                </Timeline.Body>
            );
            break;
        }
    }
    return (
        <Timeline>
            <Timeline.Item>
                <Timeline.Point icon={HiCalendar} />
                <Timeline.Content>
                    <Timeline.Time>{obj.time}</Timeline.Time>
                    <Link to={obj.link}> {obj.title}</Link> {obj.body}
                    {idx === 0 && (
                        <Link to={obj.link}>
                            <Button color='gray'>
                                Check it out!
                                <HiArrowNarrowRight className='ml-2 h-3 w-3' />
                            </Button>
                        </Link>
                    )}
                </Timeline.Content>
            </Timeline.Item>
        </Timeline>
    );
}
