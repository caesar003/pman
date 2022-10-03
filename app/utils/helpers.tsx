const helpers = {
    taskStatus: [
        {elClass: 'todo', color: '#64748B'},
        {elClass: 'ongoing', color: '#76A9FA'},
        {elClass: 'done', color: '#84CC16'},
    ],
    taskPriorities: [
        {elClass: 'low', color: 'grey'},
        {elClass: 'medium', color: 'orange'},
        {elClass: 'high', color: 'red'},
    ],
    updateTitles: [],

    capitalize: (str: string) => `${str[0].toUpperCase()}${str.slice(1)}`,
    timelineConstuctor: ({projects, logs, formatDate}) => {
        const res = [];
        for (let i = 0; i < logs.length; i++) {
            const obj = {
                title: '',
                link: '',
                date: formatDate(logs[i].createdAt),
                id: logs[i].id,
                projectId: null,
                name: '',
            };
            switch (logs[i].activity) {
                case 'create project': {
                    const project = projects.find(
                        (m) => m.id === logs[i].projectId,
                    );
                    obj.title = `You created ${project.name} project`;
                    obj.projectId = project.id;
                    break;
                }
                // case 'delete project': {
                // }
                // case 'rename project': {
                // }
                // case 'change project description': {
                // }
                case 'create task': {
                    obj.title = 'You created a task';
                    break;
                }
                // case 'update task': {
                //     obj.title = 'You update a task';
                //     break;
                // }
                case 'delete task': {
                    // return 'deleting a task';
                }
                case 'rename task': {
                    obj.title = 'You rename a task';
                    break;
                }
                case 'set due': {
                    obj.title = 'You set due date';
                    break;
                }
                case 'change status': {
                    obj.title = 'You update task status';
                    break;
                }
                case 'set priority': {
                    obj.title = 'You set priority to';
                    break;
                }
            }

            res.push(obj);
        }

        return res;
    },
    getDueDate: (str) => {
        const defaultDate = '0001-01-01T00:00:00.000Z';
        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
        };

        if (new Date(str).getTime() !== new Date(defaultDate).getTime()) {
            return new Date(str).toLocaleDateString('en-US', options);
            // return <DayJS>{d}</DayJS>;
        }
        return null;
    },
    formatDate: (str) => {
        const defaultDate = '0001-01-01T00:00:00.000Z';
        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
        };

        if (new Date(str).getTime() !== new Date(defaultDate).getTime()) {
            return new Date(str).toLocaleDateString('en-US', options);
            // return <DayJS>{d}</DayJS>;
        }
        return null;
    },
    isValidDate: (d) => !!Date.parse(d),
    validators: {},
    csvDataGenerator: (project, formatDate) => {
        const {task} = project;
        let data = `ID,Name,Created at,Due,Priority,Status,Created by\n`;

        for (let i = 0; i < task.length; i++) {
            const {id, name, createdAt, due, priority, status} = task[i];

            const row = `"${id}","${name}","${formatDate(createdAt)}","${
                formatDate(due) || 'not set'
            }","${priority}","${status}","${project.user.username}"\n`;

            data += row;
        }
        return data;
    },
};

export default helpers;
