const { Canvas } = require("canvas");
const fs = import("node:fs");
const request = import("request");
const tf = import("@tensorflow/tfjs-node");

export default class Predict {
    static models: any;
    constructor() {};

    static options = {
        debug: false,
        modelPath: "./models/model.json",
        minScore: 0.30,
        maxResults: 50,
        outputNodes: ['output1', 'output2', 'output3'],
        blurNode: true,
        blurRadius: 25,
        iouThreshold: 0.5,
    };

    static labels:any[] = [ // class labels
        'exposed anus',
        'exposed armpits',
        'belly',
        'exposed belly',
        'buttocks',
        'exposed buttocks',
        'female face',
        'male face',
        'feet',
        'exposed feet',
        'breast',
        'exposed breast',
        'vagina',
        'exposed vagina',
        'male breast',
        'exposed male breast',
    ];

    static composite = {
        person: [6, 7],
        sexy: [1, 2, 3, 4, 8, 9, 10, 15],
        nude: [0, 5, 11, 12, 13]
    };

    static async rect(
        canvas, {
            x=0,y=0,
            width=0,
            height=0,
            radius=8,
            lineWidth=2,
            color="#FF0", title='', font="16px 'Arial'"
        }
    ) {
        if (!canvas) {
            return;
        }

        const ctx = canvas.canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(title, x + 4, y - 4);
    };

    static async blur(canvas, {
        // Blur Radius Settings
        left = 0, top = 0, width = 0, height = 0
    }) {
        if (!canvas) {
            return;
        }
        const blurCanvas = new Canvas(width / this.options.blurRadius, height / this.options.blurRadius);
        const blurCtx = blurCanvas.getContext('2d');
        if (!blurCtx) {
            return;
        }
        blurCtx.imageSmoothingEnabled = true;
        blurCtx.drawImage(canvas, left, top, width, height, 0, 0, blurCanvas.width, blurCanvas.height);
        const canvasCtx = canvas.canvas.getContext('2d');
        canvasCtx.drawImage(blurCanvas, left, top, width, height);
    };

    static async getModel(modelPath: string): Promise<any> {
        let o:any;
        return this.downloadImage(modelPath, async (err, model) => {
            if (err) {
                throw err;
            }
            if (!(await fs).existsSync(model)) {

            }

            const data = (await (fs)).readFileSync(model);
            const buffer_t = (await tf).node.decodeImage(data);
            const expand_t = (await tf).expandDims(buffer_t, 0);
            const cast_t = (await tf).cast(expand_t, 'float32');
            cast_t['file'] = model;

            (await tf).dispose([expand_t, buffer_t]);
            return o+=cast_t;
        })
    };

    static async saveProcImage(input, output, data) {
        if (!data) {
            return false;
        }

        return new Promise(async (resolve) => {
            const org = await this.getModel(input);
            const c = new Canvas(org.width, org.height);
            const ctx = c.getContext('2d');
            ctx.drawImage(org, 0, 0, c.width, c.height);

            for (const obj of data.parts) {
                if (this.composite.nude.includes(obj.id) && this.options.blurNode)
                {
                    this.blur(c, {
                        left: obj.box[0], top: obj.box[1], 
                        width: obj.box[2], height: obj.box[3]
                    });
                };
                this.rect(c, {
                    x: obj.box[0], y: obj.box[1], 
                    width: obj.box[2], height: obj.box[3], 
                    title: `${Math.round(100 * obj.score)}% ${obj.class}`,
                });
            };

            const out = (await fs).createWriteStream(output);
            out.on("finish", () => {
                if (this.options.debug) {
                    console.log(`Saved processed image to ${output}`);
                }
                resolve(true);
            }).on("error", (err) => {
                console.error(err);
                resolve(false);
            });

            c.createJPEGStream({
                quality: 1,
                chromaSubsampling: true,
                progressive: true
            }).pipe(out);
        })
    }

    static async procPred(boxes, scores, classes, input) {
        const b = await boxes.array();
        const s = await scores.array();
        const c = await classes.array();
        const nmsT = await (await tf).image.nonMaxSuppressionAsync(
            b[0], s, Predict.options.maxResults, Predict.options.iouThreshold, Predict.options.minScore
        );
        const nms = await nmsT.data();

        (await tf).dispose(nmsT);

        const parts:any[] = [];
        for (const i of nms) {
            const id = parseInt(i.toString());
            parts.push({
                score: s[i],
                id: c[id],
                class: this.labels[c[id]],
                box: [
                    Math.trunc(b[0][id][0]),
                    Math.trunc(b[0][id][1]),
                    Math.trunc((b[0][id][3] - b[0][id][1])),
                    Math.trunc((b[0][id][2] - b[0][id][0])),
                ],
            });
        }

        return {
            input: {
                file: input.file,
                width: input.shape[2],
                height: input.shape[1],
            },
            person: parts.filter((a) => this.composite.person.includes(a.id)).length > 0,
            sexy: parts.filter((a) => this.composite.sexy.includes(a.id)).length > 0,
            nude: parts.filter((a) => this.composite.nude.includes(a.id)).length > 0,
            parts: parts,
        }
    }

    static async runDetect(input, output) {
        (await tf).enableProdMode();
        (await tf).ready();

        let t;
        if (!this.models[this.options.modelPath]) {
            try {
                this.models[this.options.modelPath] = await (await tf).loadGraphModel(this.options.modelPath);
                this.models[this.options.modelPath].path = this.options.modelPath;
                if (this.options.debug) {
                    console.log(`[DEBUG] Model->${this.options.modelPath}->Loaded`);
                }
            } catch (e) {
                console.log(`[ERROR] Model->${this.options.modelPath}->${e}`);
                return null;
            }
        }
        t.input = await this.getModel(input);
        [t.boxes, t.scores, t.classes] = await this.models[this.options.modelPath].executeAsync(t.input, this.options.outputNodes);
        const res = await this.procPred(t.boxes, t.scores, t.classes, t.input);
        Object.keys(t).forEach(async (k) => {
            (await tf).dispose(t[k]);
        });
        await this.saveProcImage(this.options.modelPath, output, res);
        console.log(`[INFO] Image->${input}->${output}`);
        return res;
    }

    static async downloadImage(url: any, callback: (err: Error, model: any) => void) {
        var image:any;
        if ((/(\.gif|\.png|\.jpg)/gi).test(url)) {
            image = url.slice(0, url.indexOf("/"));
            image = image.slice(url.length, -4)
        }
        let fn = `${image}.jpg`;
        (await request).head(url, async (e, res) => {
            if (e) {
                throw new Error(e);
            }
            console.log(`\
            [INFO] Download->URL : ${url}\n \
            [INFO] Download->Content_Type : ${res.headers["content-type"]}\n \
            [INFO] Download->Content_Length : ${res.headers["content-length"]} \
            `);
            if (res.headers["Content-Length"] > (5 * 1000000)) {
                console.log(`\
                [ERROR] Download->URL : ${url}\n \
                [ERROR] Download->Content_Type : ${res.headers["content-type"]}\n \
                [ERROR] Download->Content_Length : ${res.headers["content-length"]} \
                [ERROR] Download->Message : File_Size_Too_Big \
                `);
                return false;
            }
            (await request)(url).pipe(
                (await fs).createWriteStream(fn).on("close", callback ?? function (e) {
                    if (e) {
                        throw new Error(e)
                    }
                })
            );
        });

        return fn;
    }
}