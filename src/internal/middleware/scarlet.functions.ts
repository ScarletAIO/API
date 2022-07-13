import { stopwords } from "./stopwords.config";

export function removeStopWords(string:string):string {
    let res: any = [];
    const input = string.toLowerCase().trim().replace('.', '');
    const words = input.split(' ');

    for (let i: number = 0; i < words.length; i++) {
        if (stopwords.indexOf(words[i]) === -1) {
            res.push(words[i]);
        }
    }

    return (res.join(' '));
};