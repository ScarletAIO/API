// --------------------------------------------------------- \\ Imports | Requires // --------------------------------------------------------- \\
import cld from "cld";

// --------------------------------------------------------- \\ Start of Class // --------------------------------------------------------- \\
/**
 * @class ContextAnalysis
 * @description This class is used to analyze the context of a text.
 * @author Phoenix Reid (KazutoKashima)
 * @version 1.0.0
 * @license MIT
 * @example
 * const context = ContextAnalysis();
 * context.analyze("This is a test");
 * context.getContext().then(context => {
 *    console.log(context);
 * });
 */
export default new class ContextAnalysis {
    topic: any[] = [];
    score: number = 0;
    notscore: number = 0;
    
    /**
     * @description This function is used to find the topic of a text.
     * @param {string} text The text to analyze
     * @returns {Promise<any[]>} (Promise<any[]>) An array of the topic(s) of the text
     */
    public async FindTopic(text: string): Promise<any[]> {
        try {
            let Linkers:any[] = Array(await LinkingVerbs(text).then((res) => res));
            let Expletive:any[] = Array(await Expletives(text).then(res => res));

            switch (true) {
                case Linkers.length > 0: 
                    return Promise.resolve(Linkers);
                case Expletive.length > 0:
                    return Promise.resolve(Expletive);

                default: 
                    return Promise.resolve([""]);
            }
        } catch(err) {
            return Promise.reject(console.log(err));
        }
    }

    /**
     * @description This function is used to find the language of a text.
     * @param text The text to analyze
     * @returns {Promise<string>} Promise<string> The language of the text
     */
    public async IdentifyLanguage(text: string): Promise<string> {
        try {
            return Promise.resolve((await cld.detect(text)).languages[0].code);
        } catch(err) {
            return Promise.reject(console.log(err));
        }
    }

    /**
     * @description This function is used to find the Sentimental values of the topic.
     * @param topic The topic to analyze
     * @param language The language of the topic
     */
    public async analyze(topic: string, language: string[]) {
        if ((!topic || !language) || (topic.length == 0 || language.length == 0)) {
            return  Promise.reject(undefined);
        }
        if (language[0] != "en") {
            return Promise.reject(undefined);
        }

        let topic_array = Array(topic);
        let j:number, hits:number, nextitem: PropertyKey, topics: any[], notscore: number, addPush: (t: number, score: number) => void;
        topics = [];
        const topicSentiment = require("./topics.json");
        addPush = function(t:number, score: number) {
            hits += score;
            return topics.push(t);
        }
        hits = notscore = 0;
        for (let i = j = 0, len = topic_array.length; j < len; i = ++j) {
            let item:any = topic_array[i];
            if (topicSentiment.hasOwnProperty(item)) {
                if (topicSentiment[item] < 0) {
                    addPush(item, topicSentiment[item]);
                } else if (topicSentiment[item] === 0) {
                    nextitem = topic_array[++j];
                    if (topicSentiment.hasOwnProperty(nextitem)) {
                        if (topicSentiment[nextitem] > 0) {
                            notscore = 2 * topicSentiment[nextitem];
                            notscore = ~notscore + 1;
                            addPush(item, topicSentiment[nextitem]);
                        }
                    } else {
                        nextitem = topic_array[++j];
                        if (topicSentiment.hasOwnProperty(nextitem)) {
                            if (topicSentiment[nextitem] > 0) {
                                notscore = 2 * topicSentiment[nextitem];
                                notscore = ~notscore + 1;
                                addPush(item, topicSentiment[nextitem]);
                            }
                        }
                    }
                    --j;
                }
            }
        }

        this.topic = topics;
        this.score = hits;
        this.notscore = notscore;
    }

    /**
     * @description This function is used to get the results of the analysis.
     * @returns {Promise<{topic: any[], score: number, notscore: number}>} Promise<string> The results of the analysis
     */
    public async getContext(): Promise<{
        topic: any[],
        score: number,
        notscore: number
    }> {
        return Promise.resolve({
            topic: this.topic,
            score: this.score,
            notscore: this.notscore,
        });
    }
}
// --------------------------------------------------------- \\ End of Class // --------------------------------------------------------- \\

// --------------------------------------------------------- \\ Start of Internal Functions // --------------------------------------------------------- \\

/**
 * @description This function is used to find the Nouns in the text.
 * @param text The text to analyze
 * @returns Promise<string[]> An array of the Nouns in the text
 */
async function Nouns(text:string): Promise<string[]> {
    // Identify nouns of the text.
    let nounList:string[] = [];
    let adjectiveList:string[] = [];
    const pos = require("pos");
    const words = new pos.Lexer().lex(text);
    const tagger = new pos.Tagger();
    const taggedWords = tagger.tag(words);
    for (let i in taggedWords) {
        const word = taggedWords[i];
        const tag = word[1];
        const word_ = word[0];
        if (tag === "NN" || tag === "NNP" || tag === "NNS") {
            adjectiveList.push(word_);
        }
    }

    return nounList;
}

/**
 * @description This function is used to find the Adjectives in the text.
 * @param text The text to analyze
 * @returns Promise<string[]> An array of the Adjectives in the text
 */
async function Adjectives(text:string): Promise<string[]> {
    let adjectiveList:string[] = [];
    const pos = require("pos");
    const words = new pos.Lexer().lex(text);
    const tagger = new pos.Tagger();
    const taggedWords = tagger.tag(words);
    for (let i in taggedWords) {
        const word = taggedWords[i];
        const tag = word[1];
        const word_ = word[0];
        if (tag === "JJ") {
            adjectiveList.push(word_);
        }
    }

    return adjectiveList;
}

/**
 * @description This function is used to find the linkers of a text.
 * @param text The text to analyze
 * @returns Promise<string[]> An array of the linking verbs of the text
 */
async function LinkingVerbs(text: string): Promise<void | never[]> {
    let nounList: Promise<string[]> = Nouns(text);
    let adjectiveList: Promise<string[]> = Adjectives(text);

    let hasNounAfter: boolean = text.match(`${["is", "were", "are", "was", "will"].forEach(linkers => linkers)} ${(await nounList).forEach(noun => {return noun})}[^a-zA-Z]`) != null;
    let hasAdjectiveAfter: boolean = text.match(`${["is", "were", "are", "was", "will"].forEach(linkers => linkers)} ${(await adjectiveList).forEach(adjective => {return adjective})}[^a-zA-Z]`) != null;

    if (hasAdjectiveAfter || hasNounAfter) {
        // remove everything after the linking verb.
        let regex = new RegExp(`${["is", "were", "are", "was", "will"].forEach(linkers => linkers)} [a-zA-Z]+[^a-zA-Z]`);
        let match = text.match(regex);
        if (match) {
            return match.forEach(m => m.replace(regex, ""));
        } else {
            return [];
        }
    } else {
        return [];
    }
}

/**
 * @description This function is used to find the Expletives of a text.
 * @param text The text to analyze
 * @returns Promise<string[]> An array of the Expletives of the text
 */
async function Expletives(text: string): Promise<string[]> {
    let expletiveList:string[] = [];
    if (text.includes("There are" || "There was")) {
        let topic = text.substring(0, 9);
        expletiveList.push(topic);
    }

    return expletiveList;
}

// --------------------------------------------------------- \\ End of Internal Functions // --------------------------------------------------------- \\