import mongoose from 'mongoose';
import { Admin, IAdmin, Roles } from './models/admin';
import Bcrypt from '../components/bcrypt';
import { AdminHistory, IAdminHistory } from './models/adminHistory';
import ErrorHandler from '../handlers/Error.Handler';
import { Ticket, ITicket } from './models/ticket';
import { TicketHistory, Sender, ITicketHistory } from './models/ticketHistory';

class DB {

	private db: mongoose.Connection;

	constructor(url: string) {
		mongoose.connect(url, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}, (err) => {
			if (err) ErrorHandler('MongoDB', err);
		});

		this.db = mongoose.connection;

		this.db.once('open', async () => {
			console.log('Database connected');

			await Ticket.updateMany({ isClosed: false }, { $set: { isClosed: true } });

			setInterval(async () => {
				const users = await Admin.find().exec();

				users.forEach((user) => {
					if (user.online && (Date.now() - (user.lastSeen || 0)) > 15000) Admin.updateOne({ _id: user._id }, { online: false }).exec();
				});
			}, 5000);
		});

		this.db.on('error', (err) => {
			ErrorHandler('MongoDB', err);
		});
	}

	public async superAdmin(): Promise<boolean> {
		const admin = await Admin.findOne({ role: Roles.SUPER });

		if (admin) return true;
		return false;
	}

	public async addSuperAdmin(data: { email: string, name: string, password: string }): Promise<boolean> {
		const exist = await this.superAdmin();

		if (exist) return false;

		const dt = { ...data, role: Roles.SUPER };

		return await this.addUser(dt);
	}

	public async addUser(data: { email: string, name: string, password: string, role: number }): Promise<boolean> {
		const exist = await this.user({ email: data.email });

		if (exist && exist.email) return false;

		data.password = await Bcrypt.encrypt(data.password);

		const user = new Admin({
			email: data.email.toLowerCase(),
			name: data.name,
			password: data.password,
			role: data.role
		});

		const saved = await user.save();

		if (saved) return true;
		return false;
	}

	public async user(query: any): Promise<IAdmin> {
		const admin = await Admin.findOne(query).exec();

		if (admin) return admin.toJSON();
		return {} as IAdmin;
	}

	public async updateUser(id: string, data: { email?: string, name?: string, password?: string }): Promise<IAdmin> {
		const user = await Admin.updateOne({ _id: id }, data).exec();

		return user;
	}

	public async compare(email: string, password: string): Promise<boolean> {
		email = email.toLowerCase();

		const user: IAdmin = (await Admin.findOne({ email: email }).select('+password') || {}) as IAdmin;

		if (user) {
			return await Bcrypt.compare(password, user.password);
		}

		return false;
	}

	public recordAdminHistory(id: string, ip: string, socketId: string, operation: number) {
		const history = new AdminHistory({
			adminId: id,
			ip: ip,
			socketId: socketId,
			operation: operation,
			timestamp: Date.now()
		});

		history.save();
	}

	public async getAdminHistory(id: string): Promise<IAdminHistory[]> {
		return await AdminHistory.find({ adminId: id }).exec();
	}

	public async createTicket(socketId: string, ip: string): Promise<ITicket> {
		const ticket = new Ticket({
			socketId: socketId,
			ip: ip,
			openedAt: Date.now(),
			isClosed: false
		});

		return await ticket.save();
	}

	public async closeTicket(id: string): Promise<ITicket> {
		const ticket = await Ticket.findOne({ _id: id }).exec();

		if (ticket) {
			ticket.isClosed = true;
			return await ticket.save();
		}

		return {} as ITicket;
	}

	public async recordMessage(data: { id: string, operatorId?: string, message: string }, assistant?: boolean): Promise<{ ticket: ITicket, last: ITicketHistory }> {
		const { id, message, operatorId } = data;

		if (id && message) {
			const ticket = await Ticket.findOne({ _id: id }).exec();
			const sender = assistant ? Sender.ASSISTANT : Sender.USER;

			if (!assistant || (assistant && operatorId)) {
				const operator = await Admin.findOne({ _id: operatorId }).exec();
				const opName = operator ? operator.name : undefined;

				if (ticket) {
					if (!ticket.isClosed || !assistant) {
						const history = new TicketHistory({
							ticketId: id,
							from: sender,
							operatorId: assistant ? operatorId : undefined,
							opName: opName,
							message: message,
							timestamp: Date.now()
						});

						ticket.isClosed = false;

						await ticket.save();

						const newHistory = await history.save();

						return { ticket: ticket, last: newHistory };
					}
				}
			}
		}

		return { ticket: {} as ITicket, last: {} as ITicketHistory };
	}

	public async getTickets(): Promise<ITicket[]> {
		return await Ticket.find().exec();
	}

	public async getTicketHistory(id: string): Promise<ITicketHistory[]> {
		return await TicketHistory.find({ ticketId: id }).exec();
	}

	public async getUsers(role: number): Promise<IAdmin[]> {
		return await Admin.find({ role: role }).exec();
	}

	public async setStatus(id: string): Promise<IAdmin> {
		return await Admin.updateOne({ _id: id }, { online: true, lastSeen: Date.now() }).exec();
	}

	public async removeUser(id: string): Promise<boolean> {
		const del = await Admin.deleteOne({ _id: id }).exec();

		return !!del.ok;
	}

}

export default DB;
