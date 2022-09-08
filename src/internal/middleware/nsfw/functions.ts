import Predict from "./predictor";
import fs from 'node:fs';

export default new class NSFW
{
    constructor() {};

    public async is_nsfw(image: string) {
        const results = await Predict.runDetect(image, `${__dirname}/models/${image}`);
        if (results?.nude || results?.sexy) {
            fs.unlinkSync(`${__dirname}/models/${image}`);
            return {
                isNsfw: true,
                res: results
            };
        } else {
            fs.unlinkSync(`${__dirname}/models/${image}`);
            return {
                isNsfw: false,
                res: results
            };
        }
    }
};