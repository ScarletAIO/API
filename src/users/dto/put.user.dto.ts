export interface PutUserDto {
    username: string;
    fistName?: string
    email: string;
    password: string;
    permissionFlags?: number;
}