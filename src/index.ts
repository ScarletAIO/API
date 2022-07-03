/** @format */

import Server from "./server";
import fastify from "fastify";
import Logger from "../logs/functions/logger";
const s = new Server(
	445,
	"0.0.0.0",
	fastify({
		logger: true,
		ignoreTrailingSlash: true,
		ignoreDuplicateSlashes: true,
		https: {
			key: "./certs/server.key",
			cert: "./certs/server.crt",
		},
	})
);

(async () => {
	try {
		s.loadDatabase();
		s.loadRoutes();
		s.start();
	} catch (e) {
		s.restart();
		Logger.send(Error(String(e)), "FATAL", false);
	}
})();
