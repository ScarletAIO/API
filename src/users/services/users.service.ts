/** @format */

import mysql from "mysql";
import fs from "node:fs";
const Importer = require("mysql-import");
import crypto from "crypto";
import path from "node:path";
import nodemailer from "nodemailer";
import Logger from "../../functions/logger";
import { CreateUserDto } from '../dto/create.user.dto';
import CacheManager from '../../common/services/CacheManager';
import argon2 from 'argon2';
import { escape } from "node:querystring";
import { PutUserDto } from '../dto/put.user.dto';

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
		const connection = this.createConnection();
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
	} | CreateUserDto): Promise<boolean> {
		const connection = this.createConnection();
		let { age, username, password, email, id } = userData;
		password = await argon2.hash(String(password));
		const query: string = `INSERT INTO \`users_table\` (age, username, password, email, id) VALUES (?, ?, ?, ?, ?);`;
		connection.query(query, [age, username, password, email, id], (err) => {
			if (err) {
				console.error(err);
			}
		});
		connection.end();
		new CacheManager().set(userData.id, userData);
		return true;
	}

	/**
	 * 
	 * @param {PutUserDto} userData - user data to update
	 * @param {string} userId - user id to update
	 * @param {Array} action - ["update_user", "create_jwt"] - action to perform
	 * @returns {boolean}
	 */
	async updateUserInTable(userData: PutUserDto, userId: string, action?: string): Promise<boolean> {
		const connection = this.createConnection();
		const { age, username, password, email } = userData;
		let query: string;

		switch (action)
		{
			case "update_user":
				// update the user data in the user.table
				query = `UPDATE \`users_table\` SET age = ?, name = ?, password = ?, email = ? WHERE id = ?;`;
				connection.query(query, [age, username, password, email, userId], (err) => {
					if (err) {
						console.error(err);
					}
				});
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
			return true;
			
			case "create_jwt":
				const { token } = userData;
				query = `UPDATE users_table SET token = ? WHERE id = ?`;
				connection.query(query, [token, userId], (err) => {
					if (err) {
						console.error(err);
					}
					console.warn(`Token updated for user ${userId}`);
				}).on("result", (result: any) => {
					console.verbose(result);
				});
				connection.end();
				/**new CacheManager().get(userId).then((user: any) => {
					user.token = token;
					new CacheManager().del(userId);
					new CacheManager().set(userId, user);
				}).catch((err: any) => {
					console.error(err);
				});*/
				return true;
			default:
				// update the user data in the user.table
				query = `UPDATE \`users_table\` SET age = ?, name = ?, password = ?, email = ? WHERE id = ?;`;
				connection.query(query, [age, username, password, email, userId], (err) => {
					if (err) {
						console.error(err);
					}
				});
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
			return true;
		}

	}

	async deleteUserFromTable(userid: string): Promise<mysql.Query> {
		const connection = this.createConnection();
		// delete the user data from the user.table
		const query: string = `DELETE FROM \`users_table\` WHERE id = ?;`;
		const result: any = await connection.query(query, [userid]);
		connection.end();
		new CacheManager().del(userid);
		return result[0];
	}

	async getUserFromTable(userid: string): Promise<mysql.Query> {
		const connection = this.createConnection();
		let user:any = [];
		return connection.query(`SELECT * FROM users_table WHERE id = ?;`, [userid])
			.on("result", (res) => {
				return user.push(JSON.stringify(res));
			});
	}

	async getAllUsersFromTable(): Promise<mysql.Query> {
		const connection = this.createConnection();
		// get all the user data from the user.table
		const query: string = `SELECT * FROM \`users_table\`;`;
		const result: any = await connection.query(query);
		connection.end();
		return result[0];
	}

	async getUserFromTableByParam(
		userData: any | {},
		param: string,
	): Promise<mysql.Query> {
		const connection = this.createConnection();
		// get the user data from the user.table
		const query: string = `SELECT * FROM \`users_table\` WHERE ? = ?;`;
		const result: any = await connection.query(query, [param, userData[param]]);
		connection.end();
		return result[0];
	}

	async encryptDatabase() {
		const connection = this.createConnection();
		const query = "select * from \`users_table\`;";
		const result = connection.query(query);
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
					}, () => {
						console.log("Database encrypted");
					}
				);
			},
		);
	}
}