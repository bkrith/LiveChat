import express, { Request, Response, Router } from 'express';
import IControllerBase from '../interfaces/IControllerBase';

/*

It's an example controller

*/

class HomeController implements IControllerBase {
	public path: string;
	public router: Router;

	constructor() {
		this.path = '/';
		this.router = express.Router();

		this.initRoutes();
	}

	public initRoutes(): void {
		this.router.get(this.path, this.index);
	}

	public index(req: Request, res: Response): void {

		const users = [
			{
				id: 1,
				name: 'Ali'
			},
			{
				id: 2,
				name: 'Can'
			},
			{
				id: 3,
				name: 'Ahmet'
			}
		];

		res.send({ users });
	}
}

export default HomeController;
