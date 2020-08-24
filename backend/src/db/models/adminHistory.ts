import mongoose, { Document } from 'mongoose';

const Operations = {
	LOGIN: 1,
	LOGOUT: 2,
	REFRESH: 3
};

const adminHistorySchema = new mongoose.Schema({
	adminId: { type: String, required: true },
	ip: { type: String, required: true },
	socketId: { type: String, required: true },
	operation: { type: Number, required: true },
	timestamp: { type: Number, required: true }
});

const AdminHistory = mongoose.model<IAdminHistory>('AdminHistory', adminHistorySchema);

interface IAdminHistory extends Document {
	adminId: string;
	ip: string;
	socketId: string;
	operation: number;
	timestamp: number;
}

export { AdminHistory, IAdminHistory, Operations };
