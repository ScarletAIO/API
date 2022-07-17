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
        const isMalware = await Malware.detect(req.body.domain);

        if (phished.blocked && 
            (
                isMalware.stats.suspicious > 0 || 
                isMalware.stats.malicious > 0
            )
        ) {
            return res.status(201).send({
                message: "Link analysis.",
                input: req.body.domain,
                phished: phished,
                malware: isMalware.stats,
                reporters: isMalware.results.forEach(av => {
                    av.engine_name;
                })
            });
        }

        else if (phished.blocked && !(isMalware.stats.suspicious > 0 || isMalware.stats.malicious > 0))
        {
            return res.status(201).send({
                message: "Link analysis.",
                input: req.body.domain,
                phished: phished,
            });
        } else {
            return res.status(201).send({
                message: "Link analysis.",
                input: req.body.domain,
                phished: phished,
                malware: isMalware.stats,
            });
        }
    }
}