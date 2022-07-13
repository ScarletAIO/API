import { afinn } from './afinn.config';
import { removeStopWords } from './scarlet.functions';
export default new class Sentimood {
    constructor() {};

    private negativity(text: string) {
        let addPush: (t: number, score: number) => any, nextitem: PropertyKey, hits: number, i: number, item: any, j: number, len: number, noPunc: string, tokens: string | any[], words: any[];
        let notscore  = 0;
        addPush = function(t:number, score: number) {
            hits -= score;
            return words.push(t);
        }
        noPunc = text.replace(/[^'a-zA-Z ]+/g, ' ').replace('/ {2,}/', ' ');
        tokens = noPunc.toLowerCase().split(' ');
        hits = 0;
        words = [];
        for (i = j = 0, len = tokens.length; j < len; i = ++j) {
            item = tokens[i];
            if (afinn.hasOwnProperty(item)) {
                if (afinn[item] < 0) {
                    addPush(item, afinn[item]);
                } else if(afinn[item] == 0) { //Negation Handling added.
                    nextitem = tokens[++j];
                    if(afinn.hasOwnProperty(nextitem)) {
                        if(afinn[nextitem] > 0) {
                            notscore = 2*afinn[nextitem];
                            notscore = ~notscore + 1;
                            addPush(item, notscore);
                        }
                    } else {
                        nextitem = tokens[++j];
                        if(afinn.hasOwnProperty(nextitem)) {
                            if(afinn[nextitem] > 0) {
                                notscore = 2*afinn[nextitem];
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
    };

    private positivity(text: string) {
        let addPush: (t: number, score: number) => any, nextitem: PropertyKey, hits: number, i: number, item: any, j: number, len: number, noPunc: string, tokens: string | any[], words: any[];
        let posscore  = 0;
        addPush = function(t:number, score: number) {
            hits += score;
            return words.push(t);
        }
        noPunc = text.replace(/[^'a-zA-Z ]+/g, ' ').replace('/ {2,}/', ' ');
        tokens = noPunc.toLowerCase().split(' ');
        hits = 0;
        words = [];
        for (i = j = 0, len = tokens.length; j < len; i = ++j) {
            item = tokens[i];
            if (afinn.hasOwnProperty(item)) {
                if (afinn[item] > 0) {
                    addPush(item, afinn[item]);
                } else if(afinn[item] == 0) { //Negation Handling added.
                    nextitem = tokens[++j];
                    if(afinn.hasOwnProperty(nextitem)) {
                        if(afinn[nextitem] < 0) {
                            posscore = 2*afinn[nextitem];
                            posscore = ~posscore + 1;
                            addPush(item, posscore);
                        }
                    } else {
                        nextitem = tokens[++j];
                        if(afinn.hasOwnProperty(nextitem)) {
                            if(afinn[nextitem] < 0) {
                                posscore = 2*afinn[nextitem];
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
    };

    public analyze(text: string): { score: number, comparative: number, words: string[], negativity: { score: number, comparative: number, words: string[] }, positivity: { score: number, comparative: number, words: string[] } } {
        text = removeStopWords(text);
        
        return {
            score: this.positivity(text).score - this.negativity(text).score,
            comparative: this.positivity(text).comparative - this.negativity(text).comparative,
            words: this.positivity(text).words.concat(this.negativity(text).words),
            positivity: this.positivity(text),
            negativity: this.negativity(text)
        }
    }
}