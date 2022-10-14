import { Application } from "express";
import { MessageDTO } from "../../dtos/message.dto";

module.exports = (app: Application) => {
    app.get("/v2/users/:[0-9a-zA-Z]", (req?, res?) => {
        res.status(503).send({
            message: "This endpoint is currently unavailable",
            status: 503,
            error: "This endpoint is currently under development"
        } as MessageDTO);
    });
}