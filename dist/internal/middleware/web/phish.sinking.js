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
exports.PhishingDetect = void 0;
const axios_1 = __importDefault(require("axios"));
function PhishingDetect(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        let detections = 0;
        const res = yield axios_1.default.get(`https://phish.sinking.yachts/v2/check/${domain}`, {
            headers: {
                "X-Identity": "https://scarletai.xyz"
            },
            timeout: 5000,
        });
        const listofphishing = yield res.data;
        if (res.status === 404) {
            return {
                blocked: false,
                detections: 0,
                domain: domain,
                reason: "Not in Database"
            };
        }
        if (listofphishing === true) {
            return {
                detections: detections,
                blocked: true,
                reason: "Checked externally from: [phish.sinking.yachts]",
                domain: domain,
            };
        }
        else {
            return {
                detections: detections,
                blocked: false,
                reason: "Checked externally from: [phish.sinking.yachts]",
                domain: domain,
            };
        }
    });
}
exports.PhishingDetect = PhishingDetect;
;
