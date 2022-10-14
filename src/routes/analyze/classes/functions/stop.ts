import {stopwords} from "../configs/stopwords.config";

export function removeStopWords(text:string): string {
    let out: string[] = [];
    const input = text.toLocaleLowerCase().trim().replace(/\./g, "").split(" ");

    for (let i: number = 0; i < input.length; i++)
    {
        if (stopwords.indexOf(input[i]) === -1)
        {
            out.push(input[i]);
        }
    }

    return out.join(" ");
}