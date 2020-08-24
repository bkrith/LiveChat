import bcrypt from 'bcrypt';

class Bcrypt {

	public static async encrypt(password: string): Promise<string> {
		return await bcrypt.hash(password, await bcrypt.genSalt(10));
	}

	public static async compare(password: string, hash: string): Promise<boolean> {
		return await bcrypt.compare(password, hash);
	}

}

export default Bcrypt;
