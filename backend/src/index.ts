import App from './components/App';
import bodyParser from 'body-parser';
import HomeController from './controllers/home.controller';
import loggerMiddleware from './middlewares/logger';
import errorMiddleware from './middlewares/error';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('config.json').toString('utf8'));

const app = new App({
	config: config,
	controllers: [
		new HomeController()
	],
	middleWares: [
		bodyParser.json(),
		bodyParser.urlencoded({ extended: true }),
		loggerMiddleware
	],
	middleWaresAfterRoutes: [
		errorMiddleware
	]
});

app.listen();
