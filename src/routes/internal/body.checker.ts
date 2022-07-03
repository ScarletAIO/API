/** @format */

import Ajv from "ajv";
import Logger from "../../../logs/functions/logger";
const ajv = new Ajv();

const schema = {
	type: "object",
	properties: {
		username: { type: "string" },
		password: { type: "string" },
		email: { type: "string" },
	},
	required: ["username", "password", "email"],
	additionalProperties: true,
};

export function checkBody(body: Request): Promise<any> {
	return new Promise((reject, resolve) => {
		for (const key in body) {
			if (body.hasOwnProperty(key)) {
				if (
					key === "username" ||
					key === "password" ||
					key === "email"
				) {
					if (body[key] === undefined) {
						reject(`${key} is undefined`);
					}

					// check if the key matches the types in schema.properties
					for (const key2 in schema.properties) {
						if (schema.properties.hasOwnProperty(key2)) {
							if (key2 === key) {
								const validate = ajv.compile(schema);
								const valid = validate(body);
								if (valid) {
									resolve(body);
								} else {
									Logger.send(
										Error(`${key2} is not valid`),
										"error",
										false
									);
									reject(`${key2} is not valid`);
								}
							}
						}
					}
				}
			}
		}
	});
}
