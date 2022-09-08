import shortid from 'shortid';
import debug from 'debug';
import { CreateUserDto } from '../dto/create.user.dto';
import { PutUserDto } from '../dto/put.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';
import Logger from '../../functions/logger';
import { User } from './user.schema';
// import { PermissionFlags } from "../../common/middleware/common.permissionFlags.enum";

const log: debug.IDebugger = debug('app:users-dao');
const console: Logger = new Logger();

export default new class UsersDao {
    private users: Array<User> = [];
    constructor() {
        log('UsersDao constructor called.');
    }
    public async createUser(user: CreateUserDto): Promise<User> {
        const newUser: User = {
            // @ts-ignore
            id: shortid.generate(),
            ...user,
            token: '',
            permissionFlags: 0,
        };

        this.users.push(newUser);

        console.log(`Created user: ${JSON.stringify(newUser)}`);

        return newUser;
    }

    public async getUser(id: string): Promise<User> {
        const user = this.users.find((u: User) => u.id === id);

        if (!user) {
            throw new Error(`User with id ${id} not found.`);
        }

        return user;
    }

    public async getUsers(): Promise<Array<User>> {
        return this.users;
    }

    public async putUser(id: string, user: PutUserDto): Promise<User> {
        const existingUser: User = await this.getUser(id);

        const updatedUser: User = {
            ...existingUser,
            ...user,
        };

        const index: number = this.users.findIndex((u: User) => u.id === id);

        this.users[index] = updatedUser;
        
        console.log(`Updated user: ${JSON.stringify(updatedUser)}`);

        return updatedUser;
    }

    public async patchUser(id: string, user: PatchUserDto): Promise<User> {
        const existingUser: User = await this.getUser(id);

        const updatedUser: User = {
            ...existingUser,
            ...user,
        };

        const index: number = this.users.findIndex((u: User) => u.id === id);

        this.users[index] = updatedUser;

        return updatedUser;
    }

    public async deleteUser(id: string): Promise<User> {
        const existingUser: User = await this.getUser(id);

        const index: number = this.users.findIndex((u: User) => u.id === id);

        this.users.splice(index, 1);

        return existingUser;
    }
}