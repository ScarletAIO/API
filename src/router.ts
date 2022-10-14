import { Application } from "express";

module.exports = (app: Application) => {
    // The home route:
    app.use("/", require("./routes/home/base"));
    // The user route:
    app.use("/v2/users", require("./routes/user/user"));
    // The chat route:
    app.use("/v2/chat", require("./routes/extra/chat"));
    // The analyze route:
    app.use("/v2/analyze", require("./routes/analyze/analyzer"));
};