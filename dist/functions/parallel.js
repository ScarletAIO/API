"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const async_1 = __importDefault(require("async"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
function runInParallel(app) {
    return function () {
        async_1.default.parallel([
            function () {
                app.use(express_1.default.json());
            },
            function () {
                app.use(express_1.default.urlencoded({ extended: true }));
            },
            function () {
                app.use((0, helmet_1.default)());
            },
            function () {
                app.use((0, cors_1.default)());
            }
        ], (err, results) => {
            if (err) {
                console.log(err);
            }
            console.log(results);
        });
    };
}
exports.default = runInParallel;
