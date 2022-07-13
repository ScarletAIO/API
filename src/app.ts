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
<<<<<<< HEAD
import { ScarletRoutes } from './internal/scarlet.routes.config';
=======
>>>>>>> 9e830135719368806e303ca469467c7088acc922

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port: number = Number(process.env.PORT || 3000);
const routes: Array<CommonRoutesConfig> = [];
const console: Logger = new Logger();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes.push(new UserRoutes(app));
routes.push(new AuthRoutes(app));
routes.push(new ScarletRoutes(app));

app.get('/', (req: Request, res: Response) => {
    res.status(200).send(`Server running at port ${port}`);
})
.get("/health", (req: Request, res: Response) => {
    res.status(200).send("OK");
})
.get("/routes", (req, res) => {
    res.status(200).send(new UserRoutes(app));
})
.get("/routes/auth", (req, res) => {
    res.status(200).send(new AuthRoutes(app));
});

export default server.listen(port, () => {
    console.log(`Server running at port ${port}`);
    routes.forEach(( route: CommonRoutesConfig ) => {
        console.debug(`Routes configured for ${route.getName()}.`);
    });
    mysqlService.connectWithRetry();
});