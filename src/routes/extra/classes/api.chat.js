"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const logger_1 = require("../../../functions/logger");
const db_handler_1 = __importDefault(require("../../../database/db.handler"));
exports.default = new class GPTChatAPI {
    processMessage(message, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = new openai_1.Configuration({
                apiKey: process.env.OPENAI_API_KEY,
            });
            const messageHistory = db_handler_1.default.getUserMessageHistory(user);
            const openai = new openai_1.OpenAIApi(config);
            let prompt = `The following is a conversation with an AI assistant. The AI can assist with various requests.\n\n${messageHistory}\nHuman:${message}\nAI:`;
            const response = yield openai.createCompletion({
                model: "text-davinci-002",
                prompt: prompt,
                max_tokens: 100,
                temperature: 0.9,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop: ["Human:", "AI:"]
            });
            if (response.status !== 200) {
                console.error(`[GPTChatAPI] Error processing message: ${response.data}`);
                (0, logger_1.saveError)(response.data);
                return "Error processing message";
            }
            else {
                // @ts-ignore
                const data = response.data.choices[0].text;
                prompt += `AI:${data}\nHuman:`;
                db_handler_1.default.updateUserMessageHistory(user, prompt);
                return data;
            }
        });
    }
};
