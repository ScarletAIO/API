import { Application } from "express";
import { MessageDTO, SentimoodDTO } from "../../dtos/message.dto";
import sentimood from "./classes/sentimood";
import virustotal from "./classes/malware";
import Phishing from "./classes/phishing";

module.exports = (app: Application) => {
    app.post(
        "/v2/analyze/:type",
        async (req, res) => {
            const type = req.params.type as string;
            const { file, text, url } = req.body;

            switch (type) {
                case "text":
                    const senti = sentimood.analyze(text);

                    // send request with MessageDTO type
                    return res.status(200).send({
                        message: "OK",
                        status: 200,
                        sentimood: senti,
                    } as MessageDTO);

                case "file": 
                    const vt = await virustotal.detect(file as string);

                    // send request with MessageDTO type
                    return res.status(200).send({
                        message: "OK",
                        status: 200,
                        virusTotal: vt,
                    } as MessageDTO);

                case "url":
                    const phishing = await new Phishing().check(url as string);

                    // send request with MessageDTO type
                    return res.status(200).send({
                        message: "OK",
                        status: 200,
                        phishing: phishing,
                    } as MessageDTO);

                default:
                    return res.status(400).send({
                        message: "Invalid type",
                        status: 400,
                        error: "Invalid File Type detected in path!"
                    } as MessageDTO);
            }
        }
    )
}