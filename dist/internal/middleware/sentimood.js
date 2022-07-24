"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const afinn_config_1 = require("./afinn.config");
const scarlet_functions_1 = require("./scarlet.functions");
exports.default = new class Sentimood {
    constructor() { }
    ;
    negativity(text) {
        let addPush, nextitem, hits, i, item, j, len, noPunc, tokens, words;
        let notscore = 0;
        addPush = function (t, score) {
            hits -= score;
            return words.push(t);
        };
        noPunc = text.replace(/[^'a-zA-Z ]+/g, ' ').replace('/ {2,}/', ' ');
        tokens = noPunc.toLowerCase().split(' ');
        hits = 0;
        words = [];
        for (i = j = 0, len = tokens.length; j < len; i = ++j) {
            item = tokens[i];
            if (afinn_config_1.afinn.hasOwnProperty(item)) {
                if (afinn_config_1.afinn[item] < 0) {
                    addPush(item, afinn_config_1.afinn[item]);
                }
                else if (afinn_config_1.afinn[item] == 0) { //Negation Handling added.
                    nextitem = tokens[++j];
                    if (afinn_config_1.afinn.hasOwnProperty(nextitem)) {
                        if (afinn_config_1.afinn[nextitem] > 0) {
                            notscore = 2 * afinn_config_1.afinn[nextitem];
                            notscore = ~notscore + 1;
                            addPush(item, notscore);
                        }
                    }
                    else {
                        nextitem = tokens[++j];
                        if (afinn_config_1.afinn.hasOwnProperty(nextitem)) {
                            if (afinn_config_1.afinn[nextitem] > 0) {
                                notscore = 2 * afinn_config_1.afinn[nextitem];
                                notscore = ~notscore + 1;
                                addPush(item, notscore);
                            }
                        }
                    }
                    --j;
                }
            }
        }
        return {
            score: hits,
            comparative: hits / words.length,
            words: words
        };
    }
    ;
    positivity(text) {
        let addPush, nextitem, hits, i, item, j, len, noPunc, tokens, words;
        let posscore = 0;
        addPush = function (t, score) {
            hits += score;
            return words.push(t);
        };
        noPunc = text.replace(/[^'a-zA-Z ]+/g, ' ').replace('/ {2,}/', ' ');
        tokens = noPunc.toLowerCase().split(' ');
        hits = 0;
        words = [];
        for (i = j = 0, len = tokens.length; j < len; i = ++j) {
            item = tokens[i];
            if (afinn_config_1.afinn.hasOwnProperty(item)) {
                if (afinn_config_1.afinn[item] > 0) {
                    addPush(item, afinn_config_1.afinn[item]);
                }
                else if (afinn_config_1.afinn[item] == 0) { //Negation Handling added.
                    nextitem = tokens[++j];
                    if (afinn_config_1.afinn.hasOwnProperty(nextitem)) {
                        if (afinn_config_1.afinn[nextitem] < 0) {
                            posscore = 2 * afinn_config_1.afinn[nextitem];
                            posscore = ~posscore + 1;
                            addPush(item, posscore);
                        }
                    }
                    else {
                        nextitem = tokens[++j];
                        if (afinn_config_1.afinn.hasOwnProperty(nextitem)) {
                            if (afinn_config_1.afinn[nextitem] < 0) {
                                posscore = 2 * afinn_config_1.afinn[nextitem];
                                posscore = ~posscore + 1;
                                addPush(item, posscore);
                            }
                        }
                    }
                    --j;
                }
            }
        }
        return {
            score: hits,
            comparative: hits / words.length,
            words: words
        };
    }
    ;
    analyze(text) {
        text = (0, scarlet_functions_1.removeStopWords)(text);
        return {
            score: this.positivity(text).score - this.negativity(text).score,
            comparative: this.positivity(text).comparative - this.negativity(text).comparative,
            words: this.positivity(text).words.concat(this.negativity(text).words),
            positivity: this.positivity(text),
            negativity: this.negativity(text)
        };
    }
};
