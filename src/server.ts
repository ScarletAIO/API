/** @format */

import { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import Logger from "../logs/functions/logger";
import DataHandler from "./database/handler";
import { watchFile } from "node:fs";

export default class Server {
	private port: number;
	private app: FastifyInstance;
	private host: string;
	constructor(_port: number, _host: string, _app: FastifyInstance) {
		this.port = _port;
		this.host = _host;
		this.app = _app;
	}

	async start(): Promise<void> {
		this.app.listen({ port: this.port, host: this.host }, (err, addr) => {
			if (err) {
				Logger.send(err, "FATAL", false);
				process.exit(-1);
			} else {
				Logger.send(`Server listening on ${addr}`, "info", false);
			}
		});
	}

	async stop(): Promise<void> {
		await this.app.close().catch((err: any) => {
			Logger.send(err, "FATAL", false);
			process.exit(-1);
		});
	}

	async restart(): Promise<void> {
		await this.stop();
		await this.start();
	}

	async loadRoutes(): Promise<void> {
		const routes: string[] = await fs.readdir(
			path.join(__dirname, "routes")
		);
		for (const route of routes) {
			const routePath: string = path.join(__dirname, "routes", route);
			const routeModule: any = await import(routePath);
			const routeInstance: any = new routeModule.default(this.app);
			await routeInstance.register();

			Logger.send(`Registered route: ${route}`, "info", false);
		}

		Logger.send(`Registered ${routes.length} routes`, "info", false);
	}

	async loadPlugins(): Promise<void> {
		const plugins: string[] = await fs.readdir(
			path.join(__dirname, "plugins")
		);
		for (const plugin of plugins) {
			const pluginPath: string = path.join(__dirname, "plugins", plugin);
			const pluginModule: any = await import(pluginPath);
			const pluginInstance: any = new pluginModule.default(this.app);
			await pluginInstance.register();

			Logger.send(`Registered plugin: ${plugin}`, "info", false);
		}

		Logger.send("Plugins loaded", "info", false);
	}

	async loadDatabase(): Promise<void> {
		try {
			new DataHandler().importTable("./database/tables/users.sql");
		} catch (err) {
			Logger.send(Error(String(err)), "FATAL", false);
			process.exit(-1);
		}
	}

	async saveAndCloseDatabase(): Promise<void> {
		try {
			new DataHandler().encryptDatabase();
			new DataHandler().closeConnection();
		} catch (err) {
			Logger.send(Error(String(err)), "FATAL", false);
			process.exit(-1);
		}
	}

	async reloadRoutes(): Promise<void> {
		// get list of route files:
		const routes: string[] = (
			await fs.readdir(path.join(__dirname, "routes"))
		).filter((f: string) => f.endsWith(".routes.js"));
		// for each route file:
		for (const route of routes) {
			// get route file path:
			const routePath: string = path.join(__dirname, "routes", route);
			// watch the file:
			watchFile(routePath, async (curr, prev) => {
				// if the file has been modified:
				if (curr.mtimeMs !== prev.mtimeMs) {
					// reload the route:
					const routeModule: any = await import(routePath);
					const routeInstance: any = new routeModule.default(
						this.app
					);
					await routeInstance.register();

					Logger.send(`Reloaded route: ${route}`, "info", false);
				}

				// if the file has been deleted:
				if (curr.mtimeMs === 0) {
					// unregister the route:
					const routeModule: any = await import(routePath);
					const routeInstance: any = new routeModule.default(
						this.app
					);
					await routeInstance.unregister();
				}

				// if the file has been created:
				if (prev.mtimeMs === 0) {
					// register the route:
					const routeModule: any = await import(routePath);
					const routeInstance: any = new routeModule.default(
						this.app
					);
					await routeInstance.register();

					Logger.send(`Registered route: ${route}`, "info", false);
				}

				// if the file has been renamed:
				if (curr.mtimeMs !== 0 && prev.mtimeMs !== 0) {
					// unregister the route:
					let routeModule: any = await import(routePath);
					let routeInstance: any = new routeModule.default(this.app);
					await routeInstance.unregister();

					// register the route:
					routeModule = await import(routePath);
					routeInstance = new routeModule.default(this.app);
					await routeInstance.register();

					Logger.send(`Reloaded route: ${route}`, "info", false);
				}

				// if the file has been moved:
				if (curr.mtimeMs !== 0 && prev.mtimeMs === 0) {
					// unregister the route:
					let routeModule: any = await import(routePath);
					let routeInstance: any = new routeModule.default(this.app);
					await routeInstance.unregister();

					// register the route:
					routeModule = await import(routePath);
					routeInstance = new routeModule.default(this.app);
					await routeInstance.register();

					Logger.send(`Reloaded route: ${route}`, "info", false);
				}
			});
		}
	}

	async reloadPlugins(): Promise<void> {
		// get list of plugin files:
		const plugins: string[] = (
			await fs.readdir(path.join(__dirname, "plugins"))
		).filter((f: string) => f.endsWith(".plugins.js"));
		// for each plugin file:
		for (const plugin of plugins) {
			// get plugin file path:
			const pluginPath: string = path.join(__dirname, "plugins", plugin);
			// watch the file:
			watchFile(pluginPath, async (curr, prev) => {
				// if the file has been modified:
				if (curr.mtimeMs !== prev.mtimeMs) {
					// reload the plugin:
					const pluginModule: any = await import(pluginPath);
					const pluginInstance: any = new pluginModule.default(
						this.app
					);
					await pluginInstance.register();

					Logger.send(`Reloaded plugin: ${plugin}`, "info", false);
				}

				// if the file has been deleted:
				if (curr.mtimeMs === 0) {
					// unregister the plugin:
					const pluginModule: any = await import(pluginPath);
					const pluginInstance: any = new pluginModule.default(
						this.app
					);
					await pluginInstance.unregister();

					Logger.send(
						`Unregistered plugin: ${plugin}`,
						"info",
						false
					);
				}

				// if the file has been created:
				if (prev.mtimeMs === 0) {
					// register the plugin:
					const pluginModule: any = await import(pluginPath);
					const pluginInstance: any = new pluginModule.default(
						this.app
					);
					await pluginInstance.register();

					Logger.send(`Registered plugin: ${plugin}`, "info", false);
				}

				// if the file has been renamed:
				if (curr.mtimeMs !== 0 && prev.mtimeMs !== 0) {
					// unregister the plugin:
					let pluginModule: any = await import(pluginPath);
					let pluginInstance: any = new pluginModule.default(
						this.app
					);
					await pluginInstance.unregister();

					// register the plugin:
					pluginModule = await import(pluginPath);
					pluginInstance = new pluginModule.default(this.app);
					await pluginInstance.register();

					Logger.send(`Reloaded plugin: ${plugin}`, "info", false);
				}

				// if the file has been moved:
				if (curr.mtimeMs !== 0 && prev.mtimeMs === 0) {
					// unregister the plugin:
					let pluginModule: any = await import(pluginPath);
					let pluginInstance: any = new pluginModule.default(
						this.app
					);
					await pluginInstance.unregister();

					// register the plugin:
					pluginModule = await import(pluginPath);
					pluginInstance = new pluginModule.default(this.app);
					await pluginInstance.register();

					Logger.send(`Reloaded plugin: ${plugin}`, "info", false);
				}
			});
		}
	}
}
