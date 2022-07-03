/** @format */

import { FastifyInstance } from "fastify";

export const userRoutes = (router: FastifyInstance) => {
	router.get("/ping", async (req: any, res: any) => {
		return "pong";
	});

	router.get(
		"/auth",
		{
			preValidation: (request: any, reply: any, done: any) => {
				const { name, password } = request.query;
				if (name === "admin" && password === "admin") {
					done();
				} else {
					reply.code(401).send("Unauthorized");
				}
			},
		},
		async (req: any, res: any) => {
			const { name, password } = req.query;
			const customHeader = req.headers["x-auth-header"];
			return { name, password, customHeader };
		}
	);

	router.get("/users", async (req: any, res: any) => {
		const users = [
			{ id: 1, name: "John", email: "" },
			{ id: 2, name: "Doe", email: "" },
			{ id: 3, name: "Jane", email: "" },
		];
		return users;
	});

	router.get("/users/:id", async (req: any, res: any) => {
		const { id } = req.params;
		const users = [
			{ id: 1, name: "John", email: "" },
			{ id: 2, name: "Doe", email: "" },
			{ id: 3, name: "Jane", email: "" },
		];
		return users.find((user) => user.id === parseInt(id));
	});

	router.post("/users", async (req: any, res: any) => {
		const { name, email } = req.body;
		return { name, email };
	});

	router.put("/users/:id", async (req: any, res: any) => {
		const { id } = req.params;
		const { name, email } = req.body;
		return { id, name, email };
	});

	router.delete("/users/:id", async (req: any, res: any) => {
		const { id } = req.params;
		return { id };
	});

	router.get("/users/:id/posts", async (req: any, res: any) => {
		const { id } = req.params;
		const posts = [
			{ id: 1, title: "John", body: "" },
			{ id: 2, title: "Doe", body: "" },
			{ id: 3, title: "Jane", body: "" },
		];
		return posts.filter((post) => post.id === parseInt(id));
	});

	router.get("/users/:id/posts/:postId", async (req: any, res: any) => {
		const { id, postId } = req.params;
		const posts = [
			{ id: 1, title: "John", body: "" },
			{ id: 2, title: "Doe", body: "" },
			{ id: 3, title: "Jane", body: "" },
		];
		return posts.find((post) => post.id === parseInt(id));
	});
};
