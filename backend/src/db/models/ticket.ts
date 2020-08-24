import mongoose, { Document } from 'mongoose';

const ticketSchema = new mongoose.Schema({
	socketId: { type: String, unique: true },
	ip: { type: String, required: true },
	openedAt: { type: Number, required: true },
	isClosed: { type: Boolean, required: true },
	closedAt: Number
});

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);

interface ITicket extends Document {
	socketId: string;
	ip: string;
	openedAt: number;
	isClosed: boolean;
	closedAt?: number;
}

export { Ticket, ITicket };
