import { Application } from "express";

module.exports = (app: Application) => {
    app.use("/", (req?, res?) => {
        res.send("Hello world!");
    });
};