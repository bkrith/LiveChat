import { storeTypes } from './constants';

export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: number;
    online?: boolean;
}

export interface ITicket {
    _id: string;
    ip: string;
    openedAt: number;
    isClosed: boolean;
}

export interface ITicketHistory {
    _id: string;
    ticketId: string;
    message: string;
    operatorId?: string;
    opName?: string;
    timestamp: number;
    from: number;
}

export interface IRState {
    user: IUser;
    firstTime: boolean;
    tickets: ITicket[];
    activeTicket: string;
    ticketHistory: ITicketHistory[];
    operators: IUser[];
    admins: IUser[];
}

const initialState: IRState = {
    user: {} as IUser,
    firstTime: false,
    tickets: [] as ITicket[],
    activeTicket: '',
    ticketHistory: [],
    operators: [],
    admins: []
};

const rootReducer = (state = initialState, action: { type: string, payload: IUser | boolean | ITicket[] | string | ITicketHistory[] | IUser[] }): IRState => {
    if (action.type === storeTypes.USER) {
        return Object.assign({}, state, {
            user: action.payload
        });
    }
    else if (action.type === storeTypes.FIRST_TIME) {
        return Object.assign({}, state, {
            firstTime: action.payload
        });
    }
    else if (action.type === storeTypes.TICKETS) {
        return Object.assign({}, state, {
            tickets: action.payload
        });
    }
    else if (action.type === storeTypes.ACTIVE_TICKET) {
        return Object.assign({}, state, {
            activeTicket: action.payload
        });
    }
    else if (action.type === storeTypes.TICKET_HISTORY) {
        return Object.assign({}, state, {
            ticketHistory: action.payload
        });
    }
    else if (action.type === storeTypes.OPERATORS) {
        return Object.assign({}, state, {
            operators: action.payload
        });
    }
    else if (action.type === storeTypes.ADMINS) {
        return Object.assign({}, state, {
            admins: action.payload
        });
    }

    return state;
};

export default rootReducer;