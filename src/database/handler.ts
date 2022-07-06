/** @format */

require("dotenv").config();
import mysql from "mysql";
import fs from "node:fs/promises";
import crypto from "crypto";
import path from "node:path";
import Logger from "../../logs/functions/logger";

export default class DataHandler {
	createConnection(): any {
		const connection: any = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
		});
		return connection;
	}

	closeConnection(): void {
		this.createConnection().end();
	}

	async importTable(file: string): Promise<boolean> {
		const connection: any = await this.createConnection();
		const sql: Promise<string> = fs.readFile(
			path.join(__dirname, file),
			"utf8",
		);
		connection.query(sql, (err: any, result: any) => {
			if (err) {
				Logger.send(err, "error", false);
			}
			Logger.send(result, "info", false);
			return true;
		});
		connection.end();
		return true;
	}

	async deleteUserTable(): Promise<boolean> {
		const connection: any = await this.createConnection();
		const sql: string = `DROP TABLE \`users.table\`;`;
		connection.query(sql, (err: any, result: any) => {
			if (err) {
				Logger.send(err, "error", false);
			}
			Logger.send(result, "info", false);
			return true;
		});
		connection.end();
		return true;
	}

	async addUserToTable(userData: {
		name: string;
		email: string;
		password: string;
		age: number;
		id: string;
	}): Promise<any> {
		const connection: any = await this.createConnection();
		const { age, name, password, email } = userData;
		// append the user data to the user.table
		const query: string = `INSERT INTO \`user.table\` (age, name, password, email) VALUES (?, ?, ?, ?);`;
		const result: any = await connection.query(query, [age, name, password, email]);
		connection.end();
		return JSON.stringify(result);
	}

	async updateUserInTable(userData: any | {}): Promise<any> {
		const connection: any = await this.createConnection();
		const { age, name, password, email } = userData;
		// update the user data in the user.table
		const query: string = `UPDATE \`user.table\` SET age = ?, name = ?, password = ?, email = ? WHERE id = ?;`;
		const result: any = await connection.query(query, age, name, password, email, userData.id);
		connection.end();
		return result;
	}

	async deleteUserFromTable(userData: any | {}): Promise<any> {
		const connection: any = await this.createConnection();
		// delete the user data from the user.table
		const query: string = `DELETE FROM \`user.table\` WHERE id = ?;`;
		const result: any = await connection.query(query, [userData.id]);
		connection.end();
		return result;
	}

	async getUserFromTable(userData: any | {}): Promise<any> {
		const connection: any = await this.createConnection();
		// get the user data from the user.table
		const query: string = `SELECT * FROM \`user.table\` WHERE id = ?;`;
		const result: any = await connection.query(query, [userData.id]);
		connection.end();
		return result;
	}

	async getAllUsersFromTable(): Promise<any> {
		const connection: any = await this.createConnection();
		// get all the user data from the user.table
		const query: string = `SELECT * FROM \`user.table\`;`;
		const result: any = await connection.query(query);
		connection.end();
		return result;
	}

	async getUserFromTableByParam(
		userData: any | {},
		param: string,
	): Promise<any> {
		const connection: any = await this.createConnection();
		// get the user data from the user.table
		const query: string = `SELECT * FROM \`user.table\` WHERE ? = ?;`;
		const result: any = await connection.query(query, [param, userData[param]]);
		connection.end();
		return result;
	}

	async encryptDatabase() {
		const connection = await this.createConnection();
		const query = "select * from \`user.table\`;";
		const result = await connection.query(query);
		connection.end();
		crypto.generateKey(
			"aes",
			{
				length: 256,
			},
			(err, key) => {
				if (err) throw err;
				const iv = crypto.randomBytes(16).toString("hex").slice(0, 16);
				// TODO: do not forget to save the iv for decryption
				const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
				let encrypted = cipher.update(result, "utf8", "hex");
				encrypted += cipher.final("hex");
				fs.writeFile(
					path.resolve(
						`logs/database/backups/user.${Date.now()}.sql`,
					),
					encrypted,
					{
						flag: "a+",
					},
				).catch((err) => {
					Logger.send(err, "CRITICAL", false);
				});
			},
		);
	}
}
