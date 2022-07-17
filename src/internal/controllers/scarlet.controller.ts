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
        console.warn(`Link analysis requested by ${req.ip}`);
        const phished = await PhishingDetect(req.body.domain);

        switch (this.isFile(req)) {
            case true:
                const isMalware = await Malware.detect(req.body.domain);
                return res.status(201).send({
                    message: "Link analysis.",
                    input: req.body.domain,
                    malware: isMalware.stats,

                });
            case false:
                if (phished.blocked) {
                    return res.status(201).send({
                        message: "Link analysis.",
                        input: req.body.domain,
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
                    input: req.body.domain,
                    phished,
                });
            // -----------------------------------
        }
    }

    private isFile(
        req: express.Request,
    ): boolean {
        let fileExtensionRegex = /(?:\.([^.]+))?$/; // regex to get file extension
        let fileExtension = fileExtensionRegex.test(req.body.domain)[1];
        if (!fileExtension) {
            return false;
        } else {
            return true;
        }
    }
}