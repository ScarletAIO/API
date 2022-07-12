import mysql from 'mysql';
import Logger from '../../functions/logger';
import DataHandler from '../../users/services/users.service';
import CacheManager from './CacheManager';

const console: Logger = new Logger();

export default new class MySQLService {
    constructor() {}

    getMySQL() {
        return mysql;
    };

    connectWithRetry = () => {
        console.verbose('connecting to mysql');
        new DataHandler().createConnection().connect((err) => {
            if (err) {
                console.error(err);
                setTimeout(new DataHandler().createConnection().connect, 5000);
            }
            console.verbose('connected to mysql');
        });
        new DataHandler().importTable("C:\\Users\\Phoenix Reid\\source\\apis\\Scarlet\\src\\users\\services\\users.schema.sql");
        console.verbose('connecting to redis');
        new CacheManager().createConnection().connect()
            .then(() => {
                console.verbose('connected to redis');
            }).catch(e => {
                console.error(e);
                setTimeout(new CacheManager().createConnection().connect, 5000);
            });
        return;
    };
}