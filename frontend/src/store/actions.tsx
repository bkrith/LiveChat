import { storeTypes } from "./constants";
import { IUser, ITicket, ITicketHistory } from './reducer';

export function refreshUser(user: IUser) {
    return { type: storeTypes.USER, payload: user};
};

export function isFirstTime(isFirst: boolean) {
    return { type: storeTypes.FIRST_TIME, payload: isFirst };
}

export function refreshTickets(tickets: ITicket[]) {
    return { type: storeTypes.TICKETS, payload: tickets };
}

export function setActiveTicket(id: string) {
    return { type: storeTypes.ACTIVE_TICKET, payload: id };
}

export function setTicketHistory(history: ITicketHistory[]) {
    return { type: storeTypes.TICKET_HISTORY, payload: history };
}

export function refreshOperators(operators: IUser[]) {
    return { type: storeTypes.OPERATORS, payload: operators };
}

export function refreshAdmins(admins: IUser[]) {
    return { type: storeTypes.ADMINS, payload: admins };
}