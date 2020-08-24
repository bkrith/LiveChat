import DB from '../db/DB';
import jwt from '../components/Jwt';
import { Operations } from '../db/models/adminHistory';
import { IScokets, ISocket } from '../interfaces/ISocket';

interface IEvents {
	[index: string]: IEvent;
}

interface IEvent {
	[index: string]: (data: any) => Promise<void>;
}

class SocketController {

	private sockets: IScokets;
	private db: DB;

	constructor(io: SocketIO.Server, db: DB) {
		this.sockets = io.sockets.sockets as IScokets;
		this.db = db;

		io.on('connection', (socket: SocketIO.Socket) => {
			this.init(<ISocket>socket);
		});
	}

	public resError (err: any, socket: ISocket): void {
		const message = err.message || 'Something went wrong...';

		socket.emit('resError', { error: message });
	}

	public async init (socket: ISocket) {
		const ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

		socket.use(async (packet, next) => {
			const { verified, email } = await jwt.verifySocket(socket);

			if (verified && email) {
				const user = await this.db.user({ email: email });

				if (socket.userId !== user._id) {
					socket.operator = true;
					socket.userId = user._id;

					await this.db.setStatus(user._id);
				}

				return next();
			}
			else {
				if (packet.length) {
					const event = packet[0];

					if (['superAdmin', 'login', 'chat'].includes(event)) {
						return next();
					}
				}

				this.resError({ message: 'Not Authorized!' }, socket);
				return next(new Error('Not Authorized!'));
			}
		});

		const closeTicket = () => {
			const { ticketId, operator, userId } = socket;

			if (ticketId) {
				this.db.closeTicket(ticketId);
			}
			else if (operator) {
				this.db.recordAdminHistory(userId, ip, socket.id, Operations.LOGOUT);
			}
		};

		socket.on('disconnect', () => {
			console.error('disconnected');

			closeTicket();
		});

		socket.on('error', (err: any) => {
			console.error('error', err.message);

			closeTicket();
		});

		socket.on('connect_failed', (err: any) => {
			console.error('connect failed', err.message);

			closeTicket();
		});

		socket.on('connect_error', (err: any) => {
			console.error('connect error', err.message);

			closeTicket();
		});

		const events = this.events(socket, ip, this.db);

		Object.keys(events).forEach((event) => {
			socket.on(event, (data: any) => {
				const { req, message } = data;

				events[event][req](message);
			});
		});
	}

	private toOperators(event: string, data: any) {
		const sockets = this.sockets;

		Object.keys(sockets).forEach((id) => {
			if (sockets[id].operator) {
				sockets[id].emit(event, data);
			}
		});
	}

	private async verifyRole(id: string, role: number): Promise<boolean> {
		const user = await this.db.user({ _id: id });

		if (user && user._id && role && user.role > role) return true;
		return false;
	}

	private events (socket: ISocket, ip: string, db: DB): IEvents {
		return {
			superAdmin: {
				exist: async (): Promise<void> => {
					try {
						const res = await db.superAdmin();

						socket.emit('superAdmin', res);
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				new: async (data: { email: string, name: string, password: string }): Promise<void> => {
					try {
						const res = await db.addSuperAdmin(data);

						socket.emit('superAdmin', res);
					}
					catch (err) {
						this.resError(err, socket);
					}
				}
			},
			login: {
				login: async (data: { email: string, password: string }): Promise<void> => {
					try {
						const { email, password } = data;
						const res = await db.compare(email, password);
						const user = await db.user({ email: email });

						if (res) {
							const token = jwt.gen({
								email: email.toLowerCase(),
								role: user.role,
								sId: socket.id
							});

							db.recordAdminHistory(user._id, ip, socket.id, Operations.LOGIN);
							db.setStatus(user._id);

							socket.operator = true;
							socket.userId = user._id;

							socket.emit('loggedin', token);
						}
						else {
							this.resError({ message: 'User with e-mail ' + email + ' not exist or password is wrong!' }, socket);
						}
					}
					catch (err) {
						this.resError(err, socket);
					}
				}
			},
			auth: {
				ping: async (): Promise<void> => {
					try {
						await db.setStatus(socket.userId);
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				tickets: async (): Promise<void> => {
					try {
						const tickets = await db.getTickets();

						socket.emit('tickets', tickets);
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				ticketHistory: async (data: string): Promise<void> => {
					try {
						const ticketHistory = await db.getTicketHistory(data);

						socket.emit('ticketHistory', ticketHistory);
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				closeTicket: async (data: string): Promise<void> => {
					try {
						const ticket = await db.closeTicket(data);

						socket.emit('ticket', ticket);
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				user: async (data: any): Promise<void> => {
					try {
						const user = await db.user(data);

						socket.emit('user', user);
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				users: async (role: number): Promise<void> => {
					try {
						const users = await db.getUsers(role);
						const event = (role === 1) ? 'operators' : 'admins';

						socket.emit(event, users);
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				new: async (data: { email: string, name: string, password: string, role: number }): Promise<void> => {
					try {
						const { email, name, password, role } = data;

						if (await this.verifyRole(socket.userId, role)) {
							if (email && name && password && role) {
								const added = await db.addUser(data);

								if (added) {
									const event = (role === 1) ? 'operators' : 'admins';
									socket.emit(event, await db.getUsers(role));
								}
							}
						}
						else {
							this.resError('You are not authorized!', socket);
						}
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				update: async (data: { email?: string, name?: string, password?: string }): Promise<void> => {
					try {
						const updated = await db.updateUser(socket.userId, data);

						if (updated) {
							const user = await db.user({ _id: socket.userId });

							socket.emit('user', user);
						}
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				remove: async (id: string): Promise<void> => {
					try {
						const user = await db.user({ _id: id });

						if (user && await this.verifyRole(socket.userId, user.role)) {
							const removed = await db.removeUser(id);

							if (removed) {
								const event = (user.role === 1) ? 'operators' : 'admins';
								socket.emit(event, await db.getUsers(user.role));
							}
						}
						else {
							this.resError('You are not authorized!', socket);
						}
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				message: async (data: { id: string, operatorId: string, message: string }): Promise<void> => {
					try {
						const { message, operatorId } = data;

						if (message && JSON.stringify(socket.userId) === JSON.stringify(operatorId)) {
							const { ticket, last } = await db.recordMessage(data, true);

							const sockets = this.sockets;

							Object.keys(sockets).some((socketId) => {
								if (socketId === ticket.socketId) {
									sockets[socketId].emit('message', {
										opName: last.opName,
										message: message
									});
									return true;
								}
							});

							this.toOperators('updateHistory', last);
						}
					}
					catch (err) {
						this.resError(err, socket);
					}
				}
			},
			chat: {
				create: async (): Promise<void> => {
					try {
						const ticket = await db.createTicket(socket.id, ip);

						socket.emit('created', {
							ticket: ticket._id
						});

						socket.ticketId = ticket._id;

						this.toOperators('updateTickets', ticket);
					}
					catch (err) {
						this.resError(err, socket);
					}
				},
				message: async (data: { id: string, message: string }): Promise<void> => {
					try {
						const { last } = await db.recordMessage(data);

						this.toOperators('updateHistory', last);
					}
					catch (err) {
						this.resError(err, socket);
					}
				}
			}
		};
	}

}

export default SocketController;
