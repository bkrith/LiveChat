import React, { Component } from 'react';
import TicketsList from '../components/TicketsList';
import { ISocketSendData } from '../components/LiveSocket';
import Chat from '../components/Chat';
import { connector, PropsFromRedux } from '../store/Connector';

interface IProps {
    send: (event: string, data: ISocketSendData) => void;
}

class Tickets extends Component<PropsFromRedux & IProps> {

    constructor(props: PropsFromRedux & IProps) {
        super(props);

        const { send } = props;

        send('auth', {
            req: 'tickets'
        });
    }

    render() {
        return (
            <div className="container-center">
                <div className="box">
                    <TicketsList send={ this.props.send } />
                    { this.props.activeTicket.length ? <Chat send={ this.props.send } /> : '' }
                </div>
            </div>
        );
    }

}

export default connector(Tickets);