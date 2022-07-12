/** @format */

import mysql from "mysql";
import fs from "node:fs/promises";
const Importer = require("mysql-import");
import crypto from "crypto";
import path from "node:path";
import nodemailer from "nodemailer";
import Logger from "../../functions/logger";
import { CreateUserDto } from '../dto/create.user.dto';
import CacheManager from '../../common/services/CacheManager';

const console = new Logger();
const importer = new Importer({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: Number(process.env.DB_PORT)
});

const transporter = nodemailer.createTransport({
	service: process.env.SERVICE,
	auth: {
		user: process.env.E_USER,
		pass: process.env.E_PASSWORD,
	},
});

const options = {
	from: process.env.E_HOST,
	to: process.env.E_TO,
	subject: process.env.SUBJECT,
	text: process.env.TEXT,
}

export default class DataHandler {
	createConnection(): mysql.Connection {
		const connection: mysql.Connection = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			port: Number(process.env.DB_PORT)
		})
		return connection;
	}

	closeConnection(): void {
		this.createConnection().end();
	}

	async importTable(file: string): Promise<boolean> {
		importer.import(file).then(() => {
			var files = importer.getImported();
			console.verbose(`Exported to DB: ${files}`);
			return true;
		}).catch((err: any) => {
			console.error(err);
			return false;
		});

		importer.disconnect(true);
		return true;
	}

	async deleteUserTable(): Promise<boolean> {
		const connection: any = await this.createConnection();
		const sql: string = `DROP TABLE \`users.table\`;`;
		connection.query(sql, (err: any, result: any) => {
			if (err) {
				console.error(err);
			}
			console.info(result[0]);
			return true;
		});
		connection.end();
		return true;
	}

	async addUserToTable(userData: {
		username: string;
		email: string;
		password: string;
		age: number;
		id: string;
	} | CreateUserDto): Promise<any> {
		const connection: any = await this.createConnection();
		const { age, username, password, email } = userData;
		// append the user data to the user.table
		const query: string = `INSERT INTO \`user.table\` (age, name, password, email) VALUES (?, ?, ?, ?);`;
		const result: any = await connection.query(query, [age, username, password, email]);
		connection.end();
		new CacheManager().set(userData.id, userData);
		return JSON.stringify(result[0]);
	}

	async updateUserInTable(userData: {
		username: string;
		email: string;
		password: string;
		age: number;
		id: string;
	}  | CreateUserDto, userId: string): Promise<any> {
		const connection: any = await this.createConnection();
		const { age, username, password, email } = userData;
		// update the user data in the user.table
		const query: string = `UPDATE \`user.table\` SET age = ?, name = ?, password = ?, email = ? WHERE id = ?;`;
		const result: any = await connection.query(query, age, username, password, email, userId);
		connection.end();
		new CacheManager().get(userId).then((user: any) => {
			user.age = age;
			user.username = username;
			user.password = password;
			user.email = email;
			new CacheManager().del(userId);
			new CacheManager().set(userId, user);
		}).catch((err: any) => {
			console.error(err);
		});
		return result[0];
	}

	async deleteUserFromTable(userid: string): Promise<any> {
		const connection: any = await this.createConnection();
		// delete the user data from the user.table
		const query: string = `DELETE FROM \`user.table\` WHERE id = ?;`;
		const result: any = await connection.query(query, [userid]);
		connection.end();
		new CacheManager().del(userid);
		return result[0];
	}

	async getUserFromTable(userid: string): Promise<any> {
		try {
			const user: any = await new CacheManager().get(userid);
			if (user) {
				return user;
			}

			const connection: any = await this.createConnection();
			// get the user data from the user.table
			const query: string = `SELECT * FROM \`user.table\` WHERE id = ?;`;
			const result: any = await connection.query(query, [userid]);
			connection.end();
			new CacheManager().set(userid, result[0]);
			return result[0];
		} catch (e) {
			console.error(e);
		}
	}

	async getAllUsersFromTable(): Promise<any> {
		const connection: any = await this.createConnection();
		// get all the user data from the user.table
		const query: string = `SELECT * FROM \`user.table\`;`;
		const result: any = await connection.query(query);
		connection.end();
		return result[0];
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
		return result[0];
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
				const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
				process.env.TEXT = iv;
				transporter.sendMail(options, (err, info) => {
					if (err) throw err;
					console.log(String(info));
				});
				let encrypted = cipher.update(String(result), "utf8", "hex");
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
					console.error(err);
				});
			},
		);
	}
}