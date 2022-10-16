import { ContextDTO } from "../../../dtos/message.dto";
import { removeStopWords } from "./functions/stop";
import contextConfig from "./configs/context.config";
import dbHandler from "../../../database/db.handler";
import { saveLog } from "../../../functions/logger";

export default new class Contexts {
    private contexts = contextConfig;
    public model: {}[];
    private output: ContextDTO;
    constructor() {
        this.contexts = [];
        this.model = null || [{}];
        this.output = null || {} as ContextDTO;
    }

    get knownContexts(): any[] {
        return this.contexts;
    }

    get knownModel(): {}[] {
        if (this.model == null) {
            return [{}];
        } else {
            return this.model;
        }
    };

    private removeStopWords(text: string): string {
        const toRemoveFrom = removeStopWords(text);
        return toRemoveFrom;
    }

    private tokeniseSentence(text: string, tokenMethod = "sentence"): string[] | null {
        // Check to see if there's any content in the text.
        if (text.match(/[\w]+/g) == null) {
            return null;
        } // check to see if there is a . or ? in the sentence
        else if (text.match(/(\.|\?)/g) == null) {
            return null;
        } else {
            // Otherwise we continue as normal
            switch (tokenMethod) {
                case "sentence":
                    return text.split(".");
                case "word":
                    return text.split(" ");
                case "paragraph":
                    return text.split("\n");
                default:
                    return text.split(".");
            }
        }
    }

    public getContextsFromSentence(text: string): ContextDTO {
        text = this.removeStopWords(text);
        const tokens = this.tokeniseSentence(text);
        if (tokens == null) {
            return {} as ContextDTO;
        }

        const output = this.SentiContext(text);
        if (output == false) {
            return {
                detections: "None Found",
                confidence: 0,
                message_ref: text,
            }
        } else {
            return output as ContextDTO;
        }
    }

    private SentiContext(text: string): ContextDTO | boolean {
        if (text.match(/[\w]+/g) == null) {
            return false;
        };
        let output = {} as ContextDTO;
        const contexts = this.contexts[0];
        let score:number = 0;
        // iterate through the key, value pairs in the contexts object
        for (const [key, value] of Object.entries(contexts)) {
            for (let i = 0; i < value.keywords.length; i++) {
                const element = value.keywords[i];
                if (text.match(element)) {
                    // We have a match, next we need to confirm
                    // That it doesn't match other contexts

                    // So we check if the key's crossinterpretation has types in it and if it does, 
                    // check if the text matches any of them
                    if (value.crossinterpretation.types.length > 0) {
                        const CrossIntTypes = value.crossinterpretation.types;
                        for (let i = 0; i < CrossIntTypes.length; i++) {
                            if (CrossIntTypes[i] === key) {
                                // Now we get the total matches
                                let totalMatches = 0;
                                // First we iterate through all the keywords for every key in the contexts object
                                for (const [key, value] of Object.entries(contexts)) {
                                    for (let i = 0; i < value.keywords.length; i++) {
                                        const element = value.keywords[i];
                                        // now we check if the text matches any of the keywords
                                        if (text.match(element)) {
                                            // We have a match, so we need to add it to the total matches
                                            totalMatches++;
                                        } 
                                        // Now we check if the text matches any of the crossinterpretation types
                                        for (let i = 0; i < CrossIntTypes.length; i++) {
                                            if (text.match(CrossIntTypes[i])) {
                                                // We have a match, so we need to add it to the total matches
                                                totalMatches++;
                                            }
                                        }
                                    }
                                }
                                // Now we calculate the score
                                score = totalMatches / Object.keys(contexts).length;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        output = {
                            detections: [key],
                            confidence: score,
                            message_ref: text,
                            checkId: this.checkIdGenerator(text)
                        };
                    }
                } else {
                    output = {
                        detections: "None Found",
                        confidence: 0,
                        message_ref: text,
                        checkId: this.checkIdGenerator(text)
                    };
                }
            }
        }

        return output;
    }

    private checkIdGenerator(message:string): string {
        let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        id = Buffer.from(id).toString("base64");

        // TODO: Save it into the DB
        dbHandler.addCheckID(id, message).then((res) => {
            saveLog(String(res));
        }).catch((err) => {
            saveLog(String(err));
        });

        return id;
    }
}
