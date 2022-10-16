"use strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const saveError = async (err: Error | unknown | string) => {
    // check if the type is unknown
    if (typeof err === "object") {
        // check if the type is an error
        if (err instanceof Error) {
            // check if the error has a stack
            if (err.stack) {
                // save the error to a file
                const date = new Date();
                const fileName = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}-e.log`;
                const filePath = path.join(__dirname, "..", "logs", fileName);
                const file = await fs.open(filePath, "a");
                await file.appendFile(`${date.toUTCString()} - ${err.toString()}`);
                await file.close();
            }
        }
    } else {
        // save the error to a file
        const date = new Date();
        const fileName = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}-e.log`;
        const filePath = path.join(__dirname, "..", "logs", fileName);
        const file = await fs.open(filePath, "a");
        await file.appendFile(`${date.toUTCString()} - ${err}`);
        await file.close();
    }
};

export const saveVerbose = async (message: string) => {
    // save the message to a file
    const date = new Date();
    const fileName = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}-v.log`;
    const filePath = path.join(__dirname, "..", "logs", fileName);
    const file = await fs.open(filePath, "a");
    await file.appendFile(`${date.toUTCString()} - ${message}`);
    await file.close();
};

export const saveLog = async (message: string) => {
    // save the message to a file
    const date = new Date();
    const fileName = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}-l.log`;
    const filePath = path.join(__dirname, "..", "logs", fileName);
    const file = await fs.open(filePath, "a");
    await file.appendFile(`${date.toUTCString()} - ${message}`);
    await file.close();
};