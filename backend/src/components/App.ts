import express, { Application } from 'express';
import https, { Server } from 'https';
import socketIO from 'socket.io';
import DB from '../db/DB';
import fs from 'fs';
import SocketController from '../controllers/Socket.Controller';
import path from 'path';
import jwt from './Jwt';
import IConfig from '../interfaces/IConfig';

class App {
	public port: number;
	public io: socketIO.Server;
	public server: Server;
	public app: Application;
	public db: DB;
	public socketController: SocketController;

	constructor(appInit: { config: IConfig; middleWares: any; middleWaresAfterRoutes?: any; controllers: any; }) {
		this.port = appInit.config.port;
		this.server = {} as Server;
		this.app = {} as Application;
		this.db = new DB(appInit.config.mongoURL);

		jwt.key = appInit.config.tokenKey;

		let credentials = {};

		if (appInit.config.secure) {
			credentials = {
				key: fs.readFileSync(appInit.config.secure.key),
				cert: fs.readFileSync(appInit.config.secure.cert)
			};
		}

		this.app = express();
		this.server = https.createServer(credentials, this.app);
		this.io = socketIO(this.server, {
			path: '/livechat',
		});

		this.middlewares(appInit.middleWares);
		this.routes(appInit.controllers);

		if (appInit.config.frontend) {
			this.app.use(appInit.config.frontend.route, express.static(path.join(appInit.config.frontend.path)));
			this.app.use(appInit.config.frontend.route + '/*', express.static(path.join(appInit.config.frontend.path)));
		}

		if (appInit.middleWaresAfterRoutes) this.middlewares(appInit.middleWaresAfterRoutes);

		this.socketController = new SocketController(this.io, this.db);
	}

	private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void; }) {
		middleWares.forEach(middleWare => {
			this.app.use(middleWare);
		});
	}

	private routes(controllers: { forEach: (arg0: (controller: any) => void) => void; }) {
		controllers.forEach(controller => {
			this.app.use(controller.path, controller.router);
		});
	}

	public listen(): void {
		this.server.listen(this.port, () => {
			console.log(`App listening on the https://localhost:${this.port}`);
		});
	}
}

export default App;
