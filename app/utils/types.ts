export type Log = {
    id: string;
    activity: string;
    projectId?: string;
    taskId?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    note?: string;
};
export type Task = {
    id: string;
    name: string;
    createdAt: Date;
    userId: string;
    updatedAt: Date;
    priority: string;
    status: string;
    due: Date;
    projectId: string;
};
export type Project = {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    isPrivate: boolean;
    task: Task[];
    user: User;
};
export type User = {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
    task: Task[];
    project: Project[];
    log: Log[];
};
