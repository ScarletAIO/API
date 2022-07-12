export interface CreateUserDto {
    username: string;
    fistName?: string
    email: string;
    age?: number;
    password: string;
    id: string;
    token?: string;
}