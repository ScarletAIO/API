import { Application } from "express";

module.exports = (app: Application) => {
    app.get("/", (req?, res?) => {
        res.send("Hello world!");
    });

    // TODO: have 
    app.get("/routes/:routes", async (req, res) => {
        const routes = req.params.routes as string;

        switch (routes) {
            case "all":
                return res.status(200).send({
                    "routes": {
                        "/": {
                            ":routes": {
                                "all": "Shows all the routes without a filter",
                                "auth": "Shows the auth routes and filters out the rest",
                                "analyze": {
                                    ":type": {
                                        "file": "A POST endpoint that checks whether a file is malicious or not",
                                        "link": "A POST endpoint that checks if the provided link is a phishing site or not",
                                        "text": "A POST endpoint that checks to see if a message is abusive, toxic, etc."
                                    }
                                },
                            }
                        }
                    }
                    // Add extra possibilities once finalised
                });
            case "auth": 
                return res.status(200).send({
                    "routes": {
                        "*": "Currently unavailable"
                    }
                })
            case "analyze": {
                ":type": {
                    "file": "A POST endpoint that checks whether a file is malicious or not",
                    "link": "A POST endpoint that checks if the provided link is a phishing site or not",
                    "text": "A POST endpoint that checks to see if a message is abusive, toxic, etc."
                }
            }
        }
    });
};