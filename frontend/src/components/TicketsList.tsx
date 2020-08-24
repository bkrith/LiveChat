import React, { Component } from 'react';
import { Card, Tabs, Tab, Button } from '@blueprintjs/core';
import { connector, PropsFromRedux } from '../store/Connector';
import classnames from 'classnames';
import { ITicket } from '../store/reducer';
import store from '../store';
import { setActiveTicket } from '../store/actions';
import { ISocketSendData } from './LiveSocket';

const dateTD = classnames([
    'tableTD',
    'dateTD'
]);
const headerTD = classnames([
    'tableHeader',
    'tableTD'
]);

interface IProps {
    send: (event: string, data: ISocketSendData) => void;
}

type FinalProps = PropsFromRedux & IProps;

class TicketsList extends Component<FinalProps> {

    private TicketPanel: React.FunctionComponent<{ tickets: ITicket[] }>;
    private scrollItems: number;

    constructor(props: FinalProps) {
        super(props);

        this.clickHandler = this.clickHandler.bind(this);
        this.closeHandler = this.closeHandler.bind(this);
        this.scrollHandler = this.scrollHandler.bind(this);

        this.scrollItems = 100;

        this.TicketPanel = ({ tickets }: { tickets: ITicket[] }) => {
            return (
                <div>
                    <div className="tableRow" style={{ overflowY: 'scroll' }}>
                        <div className={ headerTD } style={{ width: '100%', minWidth: '50px' }}></div>
                        <div className={ headerTD } style={{ width: '100%', minWidth: '200px' }}>ID</div>
                        <div className={ headerTD } style={{ width: '100%', minWidth: '150px' }}>IP</div>
                        <div className={ headerTD } style={{ width: '100%', minWidth: '170px' }}>Opened At</div>
                        <div className={ headerTD } style={{ width: '100%', minWidth: '100px' }}></div>
                    </div>
                    <div className="scrollTickets" onScroll={ this.scrollHandler }>
                        { tickets.slice(0, this.scrollItems).map((ticket: ITicket, index: number) => (
                            <div className={ this.props.activeTicket === ticket._id ? classnames(['tableRow', 'activeTicket']) : 'tableRow' } key={ 'ticketRow-' + index } id={ ticket._id } onClick={ this.clickHandler }>
                                <div className="tableTD" style={{ width: '100%', minWidth: '50px', textAlign: 'center' }}>{ index + 1 }</div>
                                <div className="tableTD" style={{ width: '100%', minWidth: '200px' }}>{ ticket._id }</div>
                                <div className="tableTD" style={{ width: '100%', minWidth: '150px' }}>{ ticket.ip }</div>
                                <div className={ dateTD } style={{ width: '100%', minWidth: '170px' }}>{ new Date(ticket.openedAt).toLocaleString() }</div>
                                <div className="tableTD" style={{ width: '100%', minWidth: '100px' }}>{ ticket.isClosed ? '' : <Button small minimal icon="cross" onClick={ (event: React.MouseEvent<HTMLElement>) => { this.closeHandler(ticket._id); } } /> }</div>
                            </div>
                        )) }
                    </div>
                    <div className="tableRow"></div>
                </div>
            );
        };
    }

    private scrollHandler(event: React.UIEvent) {
        const element = event.currentTarget;

        if (element && element.scrollTop === (element.scrollHeight - element.clientHeight)) {
            this.scrollItems += 100;
            this.setState({});
        }
    }

    private closeHandler(id: string) {
        this.props.send('auth', {
            req: 'closeTicket',
            message: id
        });
    }

    private clickHandler(event: React.UIEvent<HTMLDivElement>) {
        const element = event.currentTarget;
    
        store.dispatch(setActiveTicket(element.id));

        this.props.send('auth', {
            req: 'ticketHistory',
            message: element.id
        });
    }

    render() {
        const openTickets = this.props.tickets.filter((ticket) => !ticket.isClosed);
        const closedTickets = this.props.tickets.filter((ticket) => ticket.isClosed);

        return (
            <Card
                id="TicketCard"
                elevation={ 4 }
                interactive={ false }
            >
                <Tabs
                    animate={ true }
                    id="Tabs"
                >
                    <Tab id="openPan" title={ 'Open Tickets ' + openTickets.length } panel={ <this.TicketPanel tickets={ openTickets } /> } />
                    <Tab id="closedPan" title={ 'Closed Tickets ' + closedTickets.length } panel={<this.TicketPanel tickets={ closedTickets } />} />
                </Tabs>
            </Card>
        );
    }

}

export default connector(TicketsList);