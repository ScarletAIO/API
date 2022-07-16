import dotenv from "dotenv";
dotenv.config();
import express, {Request, Response} from "express";
import http from "http";
import debug from "debug";
import cors from "cors";
import helmet from "helmet";
import Logger from "./functions/logger";
import { CommonRoutesConfig } from "./common/common.routes.config";
import { AuthRoutes } from "./auth/auth.routes.config";
import { UserRoutes } from "./users/user.routes.config";
import mysqlService from "./common/services/mysql.service";
import { ScarletRoutes } from './internal/scarlet.routes.config';
import path from 'node:path';
import { EventEmitter } from "stream";
const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port: number = Number(process.env.PORT || 3000);
const routes: Array<CommonRoutesConfig> = [];
const console: Logger = new Logger();

app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    frameguard: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes.push(new UserRoutes(app));
routes.push(new AuthRoutes(app));
routes.push(new ScarletRoutes(app));

app.get('/', (req: Request, res: Response) => {
    res.status(200).sendFile("routes.html", { root: path.resolve(__dirname + "/../src/") });
})
.get("/routes", (req, res) => {
    res.status(200).send(new UserRoutes(app));
})
.get("/routes/auth", (req, res) => {
    res.status(200).send(new AuthRoutes(app));
})
.get("/routes/all", (req, res) => {
    res.status(200).send([
        {
            "name": "UserRoutes",
            "paths": [
                {
                    "name": "getUser",
                    "path": "/v3/user/{id}",
                    "method": "GET",
                    "description": "Get user by id"
                },
                {
                    "name": "createUser",
                    "path": "/v3/user",
                    "method": "POST",
                    "description": "Create new user"
                },
                {
                    "name": "updateUser",
                    "path": "/v3/user/{id}",
                    "method": "PUT",
                    "description": "Update user by id"
                },
                {
                    "name": "deleteUser",
                    "path": "/v3/user/{id}",
                    "method": "DELETE",
                    "description": "Delete user by id"
                },
            ],
            "description": "User routes"
        },
        { 
            "name": "AuthRoutes",
            "paths": [
                {
                    "name": "getToken",
                    "path": "/auth/token",
                    "method": "POST",
                    "requirements": {
                        "id": "string",
                        "password": "string"
                    },
                    "description": "Get token"
                },
                {
                    "name": "getNewToken",
                    "path": "/auth/refresh-token",
                    "method": "POST",
                    "requirements": {
                        "id": "string",
                        "password": "string",
                        "refreshKey": "string",
                        "headers": {
                            "Authorization": "Bearer {access token}"
                        }
                    },
                    "description": "Get new token"
                }
            ],
    
            "description": "Auth routes"
        },
        {
            "name": "ScarletRoutes",
            "paths": [
                {
                    "name": "msgAnalyze",
                    "path": "/v3/analyze/msg",
                    "method": "POST",
                    "requirements": {
                        "text": "string"
                    },
                    "description": "Analyze a message"
                },
                {
                    "name": "analyzeLink",
                    "path": "/v3/analyze/link",
                    "method": "POST",
                    "requirements": {
                        "url": "string"
                    },
                    "description": "Analyze a domain for phishing defence"
                }
            ],
    
            "description": "Scarlet/AI routes"
        }
    ]);
});

export default server.listen(port, () => {
    console.log(`Server running at port ${port}`);
    mysqlService.connectWithRetry();
});

process.setMaxListeners(0);

process.on("warning", (warning: EventEmitter) => {
    return console.warn((String(warning)));
})