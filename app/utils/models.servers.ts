export type User = {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
};

export type Project = {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    isPrivate: boolean;
};

export type Tasks = {
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
