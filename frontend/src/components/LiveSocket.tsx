import socketIO from 'socket.io-client';
import myToaster from './MyToaster';
import { Intent } from '@blueprintjs/core';
import store from '../store';
import { refreshTickets, setTicketHistory, refreshUser, isFirstTime, refreshOperators, refreshAdmins } from '../store/actions';
import { ITicketHistory, ITicket, IUser } from '../store/reducer';

export interface ISocketSendData {
    req: string;
    message?: any;
}

export interface ISocketReceiveData {
    res: any;
}

class LiveSocket {

    private socket: SocketIOClient.Socket;

    constructor(endpoint: string, path?: string) {
        this.socket = socketIO(endpoint, {
			path: path,
			query: {
				token: localStorage.getItem('token') || undefined
			}
		});

		this.socket.on('loggedin', (data: any) => {
			if (data) {
				this.token = data;
				
				window.location.reload();
			}
		});
        
        this.socket.on('connect', () => {
			myToaster.show({
				icon: "database",
				intent: 'success',
				message: "We are connected with the Server!",
			});

			setInterval(() => {
				this.socket.emit('ping', {});
			}, 5000);

			this.socket.emit('auth', {
				req: 'users',
				message: 1
			});
	
			this.socket.emit('auth', {
				req: 'users',
				message: 2
			});

			setInterval(() => {
				this.socket.emit('auth', {
					req: 'users',
					message: 1
				});
		
				this.socket.emit('auth', {
					req: 'users',
					message: 2
				});
			}, 15000);
			
			this.socket.emit('superAdmin', {
				req: 'exist'
			});

			try {
				this.socket.emit('auth', { req: 'user', message: { email: this.token.decoded.email } });
			}
			catch (err) {
				// Do nothing
			}
        });

		this.socket.on('user', (data: IUser) => {
			store.dispatch(refreshUser(data));
		});

		this.socket.on('superAdmin', (data: boolean) => {
			store.dispatch(isFirstTime(!data));
		});
        
        this.socket.on('resError', (data: { error: string }) => {
			const { error } = data;
			if (error) {
				console.error(error);

				myToaster.show({
					icon: 'error',
					intent: Intent.DANGER,
					message: error
				});
			}
		});

		this.socket.on('disconnect', () => {
			console.error('Disconnected');
			myToaster.show({
				icon: "error",
				intent: Intent.DANGER,
				message: "Application disconnected from Server!",
			});
		});

		this.socket.on('error', (err: any) => {
			console.error('error', err.message);
			myToaster.show({
				icon: "error",
				intent: Intent.DANGER,
				message: "An error occurred while connectiong to server!",
			});
		});

		this.socket.on('connect_failed', (err: any) => {
			console.error('Connect failed', err.message);
			myToaster.show({
				icon: "error",
				intent: Intent.DANGER,
				message: "An error occurred while connectiong to server!",
			});
		});

		this.socket.on('connect_error', (err: any) => {
			console.error('Connect error', err.message);
			myToaster.show({
				icon: "error",
				intent: Intent.DANGER,
				message: "An error occurred while connectiong to server!",
			});
        });
        
        this.socket.on('tickets', (data: ITicket[]) => {
			store.dispatch(refreshTickets(data));
		});
		
		this.socket.on('ticketHistory', (data: ITicketHistory[]) => {
			store.dispatch(setTicketHistory(data));
		});

		this.socket.on('ticket', (data: ITicket) => {
			const { tickets } = store.getState();

			tickets.some((ticket, index) => {
				if (ticket._id === data._id) {
					tickets[index] = data;
					return true;
				}

				return false;
			});

			store.dispatch(refreshTickets([ ...tickets ]));
		});

		this.socket.on('updateHistory', (data: ITicketHistory) => {
			const { ticketHistory, activeTicket } = store.getState();
			if (activeTicket === data.ticketId) {
				ticketHistory.push(data);
				store.dispatch(setTicketHistory([ ...ticketHistory ]));
			}
		});

		this.socket.on('updateTickets', (data: ITicket) => {
			const { tickets } = store.getState();
			tickets.push(data);
			store.dispatch(refreshTickets([ ...tickets ]));
		});

		this.socket.on('operators', (data: IUser[]) => {
			store.dispatch(refreshOperators([ ...data ]));
		});

		this.socket.on('admins', (data: IUser[]) => {
			store.dispatch(refreshAdmins([ ...data ]));
		});
    }

    set token(token: any) {
		localStorage.setItem('token', token);

        this.socket.io.opts.query = {
            token: token
        };
    }

    get token(): any {
        const token = localStorage.getItem('token') || '';
		const decoded = JSON.parse(atob(token.split('.')[1]));

        return {
            token: token,
            decoded: decoded
        };
    }

    public on(event: string, func: (data: ISocketReceiveData) => void) {
        this.socket.on(event, func);
    }

    public emit(event: string, data: ISocketSendData) {
        this.socket.emit(event, data);
    }

}

export default LiveSocket;