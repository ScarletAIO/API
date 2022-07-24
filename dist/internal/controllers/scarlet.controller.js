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
const logger_1 = __importDefault(require("../../functions/logger"));
const sentimood_1 = __importDefault(require("../middleware/sentimood"));
const phish_sinking_1 = require("../middleware/web/phish.sinking");
const console = new logger_1.default();
exports.default = new class ScarletController {
    analyzeSentiment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`Sentiment analysis requested by ${req.ip}`);
            const analyze = sentimood_1.default.analyze(req.body.text);
            return res.status(201).send({
                message: "Sentiment analysis.",
                input: req.body.text,
                analyze: analyze,
            });
        });
    }
    analyzeLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn(`Link analysis requested by ${req.ip} - ${req.body.url}`);
            yield (0, phish_sinking_1.PhishingDetect)(req.body.url).then((scan) => {
                if (scan.blocked) {
                    return res.status(201).send({
                        message: "Link analysis.",
                        input: req.body.url,
                        scan,
                    });
                }
                else {
                    return res.status(201).send({
                        message: "Link analysis.",
                        scan
                    });
                }
            });
            /**switch (this.isFile(req)) {
                /**case true:
                    const isMalware = await Malware.detect(req.body.url);
                    return res.status(201).send({
                        message: "Link analysis.",
                        input: req.body.url,
                        malware: isMalware.stats,
    
                    });
                case false:
                    if (phished.blocked) {
                        return res.status(201).send({
                            message: "Link analysis.",
                            input: req.body.url,
                            phished,
                        });
                    } else {
                        return res.status(201).send({
                            message: "Link analysis.",
                            phished
                        });
                    }
                default:
                    return res.status(201).send({
                        message: "Link analysis.",
                        input: req.body.url,
                        phished,
                    });
                // -----------------------------------
            }**/
        });
    }
    isFile(req) {
        let fileExtensionRegex = /(?:\.([^.]+))?$/; // regex to get file extension
        let fileExtension = fileExtensionRegex.test(req.body.url)[1];
        if (!fileExtension) {
            return false;
        }
        else {
            return true;
        }
    }
};
