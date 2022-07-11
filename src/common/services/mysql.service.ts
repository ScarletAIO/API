import mysql from 'mysql';
import Logger from '../../functions/logger';
import DataHandler from '../../users/services/users.service';

const console: Logger = new Logger();

export default new class MySQLService {
    constructor() {
        this.connectWithRetry();
    }

    getMySQL() {
        return mysql;
    };

    connectWithRetry = () => {
        console.info('connecting to mysql');
        new DataHandler().createConnection()
            .then(() => {
                console.info('connected to mysql');
            }).catch((err:any) => {
                console.error(err);
                setTimeout(this.connectWithRetry, 5000);
            }) ;
        // -------------------------------------------------
    };
}