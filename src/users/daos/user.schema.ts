export interface User {
    id: string;
    username: string;
    fistName?: string;
    email: string;
    password: string;
    permissionFlags?: number;
    token: string;
}