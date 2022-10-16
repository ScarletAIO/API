"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStopWords = void 0;
const stopwords_config_1 = require("../configs/stopwords.config");
function removeStopWords(text) {
    let out = [];
    const input = text.toLocaleLowerCase().trim().replace(/\./g, "").split(" ");
    for (let i = 0; i < input.length; i++) {
        if (stopwords_config_1.stopwords.indexOf(input[i]) === -1) {
            out.push(input[i]);
        }
    }
    return out.join(" ");
}
exports.removeStopWords = removeStopWords;
