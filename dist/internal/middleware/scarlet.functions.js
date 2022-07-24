"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStopWords = void 0;
const stopwords_config_1 = require("./stopwords.config");
function removeStopWords(string) {
    let res = [];
    const input = string.toLowerCase().trim().replace('.', '');
    const words = input.split(' ');
    for (let i = 0; i < words.length; i++) {
        if (stopwords_config_1.stopwords.indexOf(words[i]) === -1) {
            res.push(words[i]);
        }
    }
    return (res.join(' '));
}
exports.removeStopWords = removeStopWords;
;
