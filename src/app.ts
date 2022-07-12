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

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port: number = Number(process.env.PORT || 3000);
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug("app");
const console: Logger = new Logger();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes.push(new UserRoutes(app));
routes.push(new AuthRoutes(app));

app.get('/', (req: Request, res: Response) => {
    res.status(200).send(`Server running at port ${port}`);
});

export default server.listen(port, () => {
    console.log(`Server running at port ${port}`);
    mysqlService.connectWithRetry();
    routes.forEach(( route: CommonRoutesConfig ) => {
        debugLog(`Routes configured for ${route.getName()}.`);
    });
});