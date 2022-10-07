import { config } from "dotenv";
config();

import helmet from "helmet";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import debug from "debug";
import { saveError } from "./functions/logger";
import Database from "./database/db.handler";
import {expressjwt as jwt} from "express-jwt";
import { generateSecret } from "./functions/secret-gen";

// Define the basics
const routes = require("./router");
const app = express();
const server = createServer(app);
const log = debug("app");
const secret = Buffer.from(generateSecret());

// Integrate the middlewares
app.set("port", process.env.PORT || 3000);
app.use(jwt({
    "secret": secret,
    "algorithms": ["HS256"],
    "credentialsRequired": false
}));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing middleware
routes(app);

// Setup port listening 
server.listen(app.get("port"), () => {
    log(`Listening on port ${app.get("port")}`);
    Database.connect();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    log(`Unhandled rejection: ${err}`);
    // Send error to error logging service
    saveError(err);
});