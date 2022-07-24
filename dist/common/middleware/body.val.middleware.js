"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = new class BodyValidationMiddleware {
    verifyBodyFieldErrors(req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).send(errors.array()[1]);
        }
        else {
            next();
        }
    }
};
