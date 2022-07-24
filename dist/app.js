"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = __importDefault(require("./functions/logger"));
const auth_routes_config_1 = require("./auth/auth.routes.config");
const user_routes_config_1 = require("./users/user.routes.config");
const mysql_service_1 = __importDefault(require("./common/services/mysql.service"));
const scarlet_routes_config_1 = require("./internal/scarlet.routes.config");
const node_path_1 = __importDefault(require("node:path"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = Number(process.env.PORT || 3000);
const routes = [];
const console = new logger_1.default();
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
app.use((0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 5, // limit each IP to 100 requests per windowMs
}));
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    frameguard: false,
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
routes.push(new user_routes_config_1.UserRoutes(app));
routes.push(new auth_routes_config_1.AuthRoutes(app));
routes.push(new scarlet_routes_config_1.ScarletRoutes(app));
app.get('/', (req, res) => {
    res.status(200).sendFile("routes.html", { root: node_path_1.default.resolve(__dirname + "/../src/") });
})
    .get("/routes", (req, res) => {
    res.status(200).send(new user_routes_config_1.UserRoutes(app));
})
    .get("/routes/auth", (req, res) => {
    res.status(200).send(new auth_routes_config_1.AuthRoutes(app));
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
                            "Authorization": "Bearer <access token>"
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
exports.default = server.listen(port, () => {
    console.log(`Server running at port ${port}`);
    mysql_service_1.default.connectWithRetry();
});
process.setMaxListeners(0);
process.on("warning", (warning) => {
    return console.warn((String(warning)));
});
