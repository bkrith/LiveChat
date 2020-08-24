import { refreshUser, isFirstTime, refreshTickets, setActiveTicket, setTicketHistory, refreshOperators, refreshAdmins } from './actions';
import { IUser, ITicket, IRState, ITicketHistory } from './reducer';
import { connect, ConnectedProps } from 'react-redux';

const mapStateToProps = (state: IRState) => {
	return {
        user: state.user,
		firstTime: state.firstTime,
		tickets: state.tickets,
		activeTicket: state.activeTicket,
		ticketHistory: state.ticketHistory,
		operators: state.operators,
		admins: state.admins
    };
};

const mapDispatchToProps = (dispatch: any) => {
	return {
		refreshUser: (user: IUser) => dispatch(refreshUser(user)),
		isFirstTime: (isFirst: boolean) => dispatch(isFirstTime(isFirst)),
		refreshTickets: (tickets: ITicket[]) => dispatch(refreshTickets(tickets)),
		setActiveTicket: (id: string) => dispatch(setActiveTicket(id)),
		setTicketHistory: (history: ITicketHistory[]) => dispatch(setTicketHistory(history)),
		refreshOperators: (operators: IUser[]) => dispatch(refreshOperators(operators)),
		refreshAdmins: (admins: IUser[]) => dispatch(refreshAdmins(admins))
	};
};

export const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;