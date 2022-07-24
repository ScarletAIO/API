import axios from "axios";
export async function PhishingDetect(domain: string) {
    domain = domain.toLowerCase();
    domain = domain.replace(/^(https|http)?:\/\//, "");
    let detections: number = 0;
    return await axios.get(`https://phish.sinking.yachts/v2/check/${domain}`, {
        headers: {
            "X-Identity": "https://scarletai.xyz"
        },
        timeout: 5000,
    }).then(async (res) => {
        const listofphishing = await res.data;
    
        if (listofphishing === true) {
            return {
                detections: detections,
                blocked: true,
                reason: "Checked externally from: [phish.sinking.yachts]",
                domain: domain,
            };
        } else {
            return await runCheckTwo(domain);
        }
    }).catch(async () => {
        return await runCheckTwo(domain);
    });
};

async function runCheckTwo(domain: string) {
    return await axios.post('https://data.phishtank.com/data/online-valid.json', {
        Headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"
        }
    })
    .then(async (res) => {
        const listofphishing = await res.data;
        for (let i = 0; i < listofphishing.length; i++) {
            if (listofphishing[i].url === `http://${domain}` &&
                listofphishing[i].verified === true) {
                return {
                    blocked: true,
                    reason: "Checked externally from: [data.phishtank.com]",
                    domain: domain,
                };
            } else {
                return {
                    blocked: false,
                    reason: "Checked externally from: [data.phishtank.com]",
                    domain: domain,
                };
            }
        }
    })
    .catch(() => {
        return {
            blocked: false,
            reason: "Checked externally from: [data.phishtank.com]",
            domain: domain,
        };
    });
}