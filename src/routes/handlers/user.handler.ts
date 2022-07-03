/** @format */

import bcrypt from "bcrypt";
import Logger, { AccessLogger } from "../../../logs/functions/logger";
export default class ClientHandler {
	private makeID(length: number): string {
		let result: string = "";
		const characters: string =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const charactersLength: number = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * charactersLength)
			);
		}
		return result;
	}

	private async GenerateToken(userId: string): Promise<string> {
		if (!userId) {
			return Promise.reject("No user specified");
		}
		const salt: string = await bcrypt.genSalt(10);
		const hash: string = await bcrypt.hash(userId, salt);
		const time: string = await bcrypt.hash(String(Date.now()), salt);
		const token: string = `${hash}-${time}`;
		return token;
	}

	public async CreateUser(req, res): Promise<any> {
		if (!req.body) {
			return Promise.reject(res.status(401).send("No body specified"));
		}
		try {
			bcrypt.genSalt(10, async (e, salt) => {
				if (e) {
					Logger.send(e, "error", false);
					return Promise.reject(
						res.status(500).send("Internal server error")
					);
				} else {
					const { age, name, password, email } = req.body;
					switch (true) {
						case !age:
							return Promise.reject(
								res.status(401).send("No age specified")
							);
						case !name:
							return Promise.reject(
								res.status(401).send("No name specified")
							);
						case !password:
							return Promise.reject(
								res.status(401).send("No password specified")
							);
						case !email:
							return Promise.reject(
								res.status(401).send("No email specified")
							);
						default:
							if (age < 13) {
								return Promise.reject(
									res
										.status(401)
										.send("Age must be 13 or older")
								);
							} else {
								const userId: string = this.makeID(10);
								const token: string = await this.GenerateToken(
									userId
								);
								const user: any = {
									id: userId,
									age,
									name,
									password,
									email,
									token,
								};
								AccessLogger(req, res);
								return Promise.resolve(
									res.status(200).send(user)
								);
							}
					}
				}
			});
		} catch (error) {
			Logger.send(Error(String(error)), "error", false);
			return Promise.reject(
				res.status(500).send("Internal Server Error")
			);
		}
	}
}
