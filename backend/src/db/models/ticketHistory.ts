import mongoose, { Document } from 'mongoose';

const Sender = {
	ASSISTANT: 0,
	USER: 1
};

const ticketHistorySchema = new mongoose.Schema({
	ticketId: { type: String, required: true },
	from: { type: Number, required: true },
	operatorId: { type: String },
	opName: { type: String },
	message: { type: String, required: true },
	timestamp: { type: Number, required: true }
});

const TicketHistory = mongoose.model<ITicketHistory>('TicketHistory', ticketHistorySchema);

interface ITicketHistory extends Document {
	ticketId: string;
	from: number;
	operatorId?: string;
	opName?: string;
	message: string;
	timestamp: number;
}

export { TicketHistory, ITicketHistory, Sender };
