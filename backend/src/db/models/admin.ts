import mongoose, { Document } from 'mongoose';

const Roles = {
	SUPER: 3,
	ADMIN: 2,
	OPERATOR: 1
};

const adminSchema = new mongoose.Schema({
	email: { type: String, unique: true },
	name: { type: String, required: true },
	password: { type: String, required: true, select: false },
	role: { type: Number, required: true },
	online: { type: Boolean },
	lastSeen: { type: Number }
});

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

interface IAdmin extends Document {
	email: string;
	name: string;
	password: string;
	role: number;
	online?: boolean;
	lastSeen?: number;
}

export { Admin, IAdmin, Roles };
