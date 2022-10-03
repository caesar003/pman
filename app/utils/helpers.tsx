import type { Project, Task, Log } from "./types";
export const isValidDate = (d: string): boolean => !!Date.parse(d);

export const updateTitles = [];

export const capitalize = (str: string) => `${str[0].toUpperCase()}${str.slice(1)}`;

export const taskStatus = [
    { status: 'todo', color: '#64748B' },
    { status: 'ongoing', color: '#76A9FA' },
    { status: 'done', color: '#84CC16' },
];

export const taskPriorities = [
    { prior: 'low', color: 'grey' },
    { prior: 'medium', color: 'orange' },
    { prior: 'high', color: 'red' },
];

export const formatDate = (str: string): string => {
    const defaultDate = '0001-01-01T00:00:00.000Z';
    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
    } as Intl.DateTimeFormatOptions;

    if (new Date(str).getTime() !== new Date(defaultDate).getTime()) {
        return new Date(str).toLocaleDateString('en-US', options);
    }

    return "";
}

export const csvDataGenerator = ({ task, user }: Project, formatDate: Function) => {
    let header = `id,name,created_at,due,priority,status,created_by`;
    let body = task.map(({ id, name, createdAt, due, priority, status }) => {
        return `"${id}","${name}","${formatDate(createdAt)}","${formatDate(due) || 'not set'
            }","${priority}","${status}","${user.username}"`;
    }).join("\n")

    return [header, body].join("\n");
};
