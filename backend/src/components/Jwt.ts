import jwt from 'jsonwebtoken';
import ErrorHandler from '../handlers/Error.Handler';
import { ISocket } from '../interfaces/ISocket';

class JWT {

	private static tokenKey: string;

	static set key(key: string) {
		this.tokenKey = key;
	}

	static get key(): string {
		return '';
	}

	public static gen(data: { email: string, role: number, sId: string }): string {
		return jwt.sign(data, this.tokenKey, {
			expiresIn: '2h'
		});
	}

	public static async verify(token: string): Promise<any> {
		try {
			return await jwt.verify(token, this.tokenKey);
		}
		catch (err){
			ErrorHandler('JWT', err);
			return false;
		}
	}

	public static async verifySocket (socket: ISocket): Promise<{ verified: boolean, email?: string }> {
		const token = await this.verify(socket.handshake.query.token);
		const expire = token.exp * 1000;

		if (token) {
			if ((expire - Date.now()) <= (15 * 60 * 1000)) { // 15 mins before expire
				const refreshToken = await this.gen({
					email: token.email,
					role: token.role,
					sId: socket.id
				});

				socket.emit('loggedin', { res: refreshToken });
			}

			return { verified: true, email: token.email };
		}
		else return { verified: false, email: undefined };
	}

}

export default JWT;
