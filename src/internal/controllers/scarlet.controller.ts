import express from 'express';
import Logger from '../../functions/logger';
import sentimood from '../middleware/sentimood';
import { PhishingDetect } from '../middleware/web/phish.sinking';
import Malware from '../middleware/web/malware.detect';

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
    ): Promise<any> {
        console.warn(`Link analysis requested by ${req.ip} - ${req.body.url}`);
        
        return await PhishingDetect(req.body.url).then((scan) => {
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