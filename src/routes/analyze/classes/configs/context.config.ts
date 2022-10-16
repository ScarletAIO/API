const contexts = [{
    "gaming": {
        "keywords": [
            "next round",
            "next game",
            "next match",
            "next time"
        ],
        "crossinterpret": true,
        "crossinterpretation": {
            types:[
                "violence",
                "abuse",
                "racism",
                "sexism",
                "homophobia",
                "transphobia",
                "hate speech",
            ]
        }
    },
    "violence": {
        "keywords": [
            "kill",
            "murder",
        ],
        crossinterpret: true,
        crossinterpretation: {
            types: [
                "gaming"
            ]
        }
    }
}];

export default contexts;