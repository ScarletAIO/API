export interface CreateUserDto {
    username: string;
    firstName?: string
    email: string;
    age?: number;
    password: string;
    id: string;
    token?: string;
}