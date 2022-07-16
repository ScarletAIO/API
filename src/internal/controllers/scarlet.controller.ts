import express from 'express';
import Logger from '../../functions/logger';
import sentimood from '../middleware/sentimood';
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
    ): Promise<any> {
        console.warn(`Link analysis requested by ${req.ip}`);
        const phished = await PhishingDetect(req.body.domain);
        if (phished.blocked == true) {
            res.status(200).json(phished);
        } else {
            res.status(200).json(phished);
        }
    }
}