import express from 'express';
import Logger from '../../functions/logger';
import sentimood from '../middleware/sentimood';
import is_nsfw from "../middleware/nsfw/functions";
import { PhishingDetect } from '../middleware/web/phish.sinking';
const console: Logger = new Logger();

export default new class ScarletController {
    async analyzeSentiment(
        req: express.Request,
        res: express.Response,
    ): Promise<any> {
        console.warn(`Sentiment analysis requested by ${req.ip}`);
        const analyze = sentimood.analyze(req.body.text);
        return res.status(201).send({
            message: "Sentiment analysis.",
            input: req.body.text,
            analyze: analyze,
        });
    }

    async analyzeLink(
        req: express.Request,
        res: express.Response,
    ) {
        console.warn(`Link analysis requested by ${req.ip} - ${req.body.url}`);
        
        await PhishingDetect(req.body.url).then((scan) => {
            if (scan?.blocked) {
                return res.status(201).send({
                    message: "Link analysis.",
                    input: req.body.url,
                    scan,
                });
            } else {
                return res.status(201).send({
                    message: "Link analysis.",
                    scan
                });
            }
        });

        /**switch (this.isFile(req)) {
            /**case true:
                const isMalware = await Malware.detect(req.body.url);
                return res.status(201).send({
                    message: "Link analysis.",
                    input: req.body.url,
                    malware: isMalware.stats,

                });
            case false:
                if (phished.blocked) {
                    return res.status(201).send({
                        message: "Link analysis.",
                        input: req.body.url,
                        phished,
                    });
                } else {
                    return res.status(201).send({
                        message: "Link analysis.",
                        phished
                    });
                }
            default:
                return res.status(201).send({
                    message: "Link analysis.",
                    input: req.body.url,
                    phished,
                });
            // -----------------------------------
        }**/
    }

    public async analyzeImage(
        req: express.Request,
        res: express.Response,
    ) {
        console.warn(`Image analysis requested by ${req.ip}`);
        let image = req.body.image || req.body.url;
        let results = await is_nsfw.is_nsfw(image);
        return res.status(200).send({
            message: "Image analysis.",
            input: image,
            results: results,
        })
    }

    private isFile(
        req: express.Request,
    ): boolean {
        let fileExtensionRegex = /(?:\.([^.]+))?$/; // regex to get file extension
        let fileExtension = fileExtensionRegex.test(req.body.url)[1];
        if (!fileExtension) {
            return false;
        } else {
            return true;
        }
    }
}