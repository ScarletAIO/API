import { SentimoodDTO } from "../../../dtos/message.dto";
import { afinn } from "./configs/afinn.config";
import { removeStopWords } from "./functions/stop"; 

export default new class Sentimood {
    constructor() {};

    private n(text: string): {
        words: any[],
        comparative: number,
        score: number
    } {
        let addPush: (t: number, score: number) => any;
        let nextItem: PropertyKey;
        let hits: number = 0;
        let score: number = 0;
        let item: any;
        let j: number;
        let i: number;
        let len: number;
        let noPunc: string = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        let tokens: string | string[] = removeStopWords(noPunc).split(" ");
        let words: any[] = [];
        let notscore: number = 0;

        addPush = (t: number, score: number) => {
            hits -= score;
            return words.push(t);
        };

        for (i = j = 0, len = tokens.length; j < len; i = j++)
        {
            item = tokens[i];
            if (afinn.hasOwnProperty(item))
            {
                // @ts-ignore
                if (afinn[item] < 0) {
                    // @ts-ignore
                    addPush(item, afinn[item]);
                // @ts-ignore
                } else if (afinn[item] == 0) { // Handle negations
                    nextItem = tokens[j++];
                    if (afinn.hasOwnProperty(nextItem)) {
                        // @ts-ignore
                        if (afinn[nextItem] > 0) {
                            // @ts-ignore
                            notscore = 2*afinn[nextItem];
                            notscore = ~notscore + 1;
                            addPush(item, notscore);
                        }
                    } else {
                        nextItem = tokens[j++];
                        if (afinn.hasOwnProperty(nextItem)) {
                            // @ts-ignore
                            if (afinn[nextItem] > 0) {
                                // @ts-ignore
                                notscore = 2*afinn[nextItem];
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
        }
    }

    private p(text: string): {
        words: any[],
        comparative: number,
        score: number
    } {
        let addPush: (t: number, score: number) => any;
        let nextItem: PropertyKey;
        let hits: number = 0;
        let score: number = 0;
        let item: any;
        let j: number;
        let i: number;
        let len: number;
        let noPunc: string = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        let tokens: string | string[] = removeStopWords(noPunc).split(" ");
        let words: any[] = [];
        let notscore: number = 0;

        addPush = (t: number, score: number) => {
            hits -= score;
            return words.push(t);
        };

        for (i = j = 0, len = tokens.length; j < len; i = j++)
        {
            item = tokens[i];
            if (afinn.hasOwnProperty(item))
            {
                // @ts-ignore
                if (afinn[item] > 0) {
                    // @ts-ignore
                    addPush(item, afinn[item]);
                // @ts-ignore
                } else if (afinn[item] == 0) { // Handle negations
                    nextItem = tokens[j++];
                    if (afinn.hasOwnProperty(nextItem)) {
                        // @ts-ignore
                        if (afinn[nextItem] < 0) {
                            // @ts-ignore
                            notscore = 2*afinn[nextItem];
                            notscore = ~notscore + 1;
                            addPush(item, notscore);
                        }
                    } else {
                        nextItem = tokens[j++];
                        if (afinn.hasOwnProperty(nextItem)) {
                            // @ts-ignore
                            if (afinn[nextItem] < 0) {
                                // @ts-ignore
                                notscore = 2*afinn[nextItem];
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
        }
    }

    public analyze(text: string): SentimoodDTO {
        let n: {
            words: any[],
            comparative: number,
            score: number
        } = this.n(text);
        let p: {
            words: any[],
            comparative: number,
            score: number
        } = this.p(text);

        return {
            negativity: n.score,
            positivity: p.score,
            comparitive: p.comparative - n.comparative,
            score: p.score - n.score,
            words: p.words.concat(n.words)
        }
    }
}