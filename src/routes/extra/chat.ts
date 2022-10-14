import { Application} from "express";
import dbHandler from "../../database/db.handler";
import apiChat from "./classes/api.chat";

module.exports = (app: Application) => {
    app.post("/v2/chat", async (req, res) => {
        // TODO: Using the IP address is only temporary
        const user = req.ip as string;
        const message = req.body.message as string;

        if (message) {
            // check if they're a user
            if (await dbHandler.getUserMessageHistory(user)) {
                // they are a user
                const response = await apiChat.processMessage(message, user);
                res.status(200).send({
                    message: response
                });
            } else {
                await dbHandler.createGPTUser(user);
                const response = await apiChat.processMessage(message, user);
                res.status(200).send({
                    message: response
                });
            }
        } else {
            res.status(400).send({
                message: "No message provided"
            });
        }
    });
};