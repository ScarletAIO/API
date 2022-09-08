import express from 'express';
import async from 'async';
import helmet from 'helmet';
import cors from 'cors';

export default function runInParallel(app: express.Application) {
    return function () {
        async.parallel([
            function() {
                app.use(express.json());
            },
            function() {
                app.use(express.urlencoded({ extended: true }));
            },
            function() {
                app.use(helmet());
            },
            function() {
                app.use(cors());
            }
        ], (err, results) => {
            if (err) {
                console.log(err);
            }

            console.log(results);
        });
    }
}