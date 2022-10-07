import { createConnection, Connection } from "mysql";
const fs = import("fs");
const path = import("path");

export default new class DatabaseHandler {
    constructor() {
        this.connection = createConnection({
            host: process.env.DB_HOST as string,
            user: process.env.DB_USER as string,
            password: process.env.DB_PASS as string,
            database: process.env.DB_NAME as string
        });

        const firstTimeRun = this.firstTimeRun();

        (async () => {
            if (await firstTimeRun) {
                console.log("[DatabaseHandler] First time run, created tables!");
            } else {
                console.log("[DatabaseHandler] Tables already exist!");
            };
        })();

        this.connect();

        this.connection.on("error", (err) => {
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                this.connect();
            } else {
                throw new Error(`[DatabaseHandler] Error connecting to database: ${err}`);
            }
        }).on("end", (err) => {
            if (err) { throw new Error(`[DatabaseHandler] Error connecting to database: ${err}`) };
            this.connect();
        }).on("close", (stream) => {
            this.connect();
        });

    }

    private connection: Connection;

    private async firstTimeRun() {
        // check if the root directory contains a file called "first-time-run"
        // if it does then we create the tables
        // if it doesn't then we don't create the tables
        const root = (await path).join(__dirname, "..");
        const file = (await path).join(root, "first-time-run");
        
        if (!(await fs).existsSync(file)) {
            // create the tables
            const tables = (await fs).readFile((await path).join(root, "models", "tables.sql"), "utf8", (err, data) => {
                if (err) { throw new Error(`[DatabaseHandler] Error reading tables.sql: ${err}`) };
                return data;
            });
            await this.query(tables as unknown as string);
            return true;
        } else {
            // don't create the tables
            return false;
        }
    }

    public connect() {
        this.connection.connect((err) => {
            if (err) { throw new Error(`[DatabaseHandler] Error connecting to database: ${err}`) };
            console.log("[DatabaseHandler] Connected to database!");
        });

        this.connection.on("error", (err) => {
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                this.connect();
            } else {
                throw new Error(`[DatabaseHandler] Error connecting to database: ${err}`);
            }
        });
    }

    public query(query: string, args: any[] = []) {
        // First check if the table exists then we send the query if it does
        const table = query.split(" ")[2];
        return new Promise((resolve, reject) => {
            this.checkTable(table).then(() => {
                this.connection.query(this.sanitizeQuery(query, args), (err, results) => {
                    if (err) { reject(err) };
                    return resolve(results);
                });
            }).catch((err) => {
                return reject(err);
            });
        });   
    }

    private sanitizeQuery(query: string, args: any[] = []) {
        let i = 0;
        return query.replace(/\?/g, () => {
            return this.connection.escape(args[i++]);
        });
    }

    private async checkTable(table: string): Promise<boolean> {
        const results = await this.query(
            "SELECT * FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1",
            [process.env.DB_NAME, table]
        );

        if ((results as any[]).length === 0) {
            throw new Error(`[DatabaseHandler] Table ${table} does not exist!`);
        } else {
            return true;
        }
    }
}