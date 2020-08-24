import React, { Component } from 'react';
import { TextArea, Button, Card, H5 } from '@blueprintjs/core';
import Message from './Message';
import { ISocketSendData } from './LiveSocket';
import store from '../store';
import { ITicket } from '../store/reducer';

interface IProps {
    send:(event: string, data: ISocketSendData) => void;
}

interface IState {
    message: string;
}

class Chat extends Component<IProps, IState> {

    private msgBoard: JSX.Element[];
    private activeHistory: string;
    private boardRef: React.RefObject<HTMLDivElement>;
    private updatedBoard: number;

    constructor(props: IProps) {
        super(props);

        this.msgBoard = [];
        this.activeHistory = '';
        this.boardRef = React.createRef();

        this.updatedBoard = 0;

        this.state = {
            message: ''
        };

        this.sendMessage = this.sendMessage.bind(this);
        this.msgHandler = this.msgHandler.bind(this);
        this.keyHandler = this.keyHandler.bind(this);
    }

    msgHandler(event: React.ChangeEvent<HTMLTextAreaElement>) {
        let { value } = event.currentTarget;

        if (value.length === 1) value = value.trim();
        this.setState({ message: value });
    }

    sendMessage() {
        let { message } = this.state;
        const { tickets, activeTicket, user } = store.getState();

        const ticket: ITicket = tickets.filter((ticket) => ticket._id === activeTicket)[0];

        if (!ticket.isClosed) {
            message = message.trim();

            if (message.length) {
                this.props.send('auth', {
                    req: 'message',
                    message: {
                        id: activeTicket,
                        operatorId: user._id,
                        message: message
                    }
                });

                this.msgBoard.push(<Message message={ message } />);

                this.setState({ message: '' });
            }
        }
    }

    keyHandler(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.stopPropagation();
            this.sendMessage();
        }
    }

    get styles() {
        return {
            component: {
                margin: '5px',
                backgroundColor: 'white',
                color: '#666666',
                flex: 1,
                display: 'flex',
                flexDirection: 'column' as 'column',
                borderRadius: '5px'
            },
            card: {
                textAlign: 'left' as 'left',
                padding: 0,
                display: 'flex',
                flexDirection: 'column' as 'column',
                height: '600px',
                marginLeft: '15px'
            },
            control: {
                main: {
                    display: 'flex',
                    alignItems: 'flex-end',
                    marginTop: '5px'
                },
                text: {
                    div: {
                        flex: 1,
                        margin: '5px'
                    },
                    textarea: {
                        maxHeight: '50px',
                        minHeight: '50px'
                    }
                },
                button: {
                    div: {
                        margin: '5px'
                    },
                    button: {
                        height: '100%'
                    }
                }
            }
        };
    }

    private refreshBoard() {
        const { ticketHistory, activeTicket, user } = store.getState();

        // fix this.. straights get in real history!
        if (ticketHistory.length && activeTicket.length && (activeTicket !== ticketHistory[0].ticketId || this.activeHistory !== ticketHistory[0].ticketId || (this.boardRef.current && this.boardRef.current.children.length < ticketHistory.length))) {
            this.msgBoard = [];

            ticketHistory.forEach((ticket) => {
                this.msgBoard.push(<Message message={ ticket.message } assistantName={ ticket.operatorId !== user._id ? ticket.opName : '' } assistant={ ticket.from ? true : false } />);
            });

            this.activeHistory = ticketHistory[0].ticketId;
        }

        if (this.boardRef.current && this.msgBoard.length !== this.updatedBoard) {
            this.boardRef.current.scrollTop = this.boardRef.current.scrollHeight;
            this.updatedBoard = this.boardRef.current.children.length;
        }
    }

    componentDidUpdate() {
        this.refreshBoard();
    }

    render() {
        const { activeTicket } = store.getState();

        this.refreshBoard();

        return (
            <Card
                id="ChatCard"
                elevation={ 4 }
                interactive={ false }
            >
                <H5 style={{ margin: '10px', color: '#666666' }}>{ activeTicket.length ? 'Ticket: ' + activeTicket : '' }</H5>
                <div style={ this.styles.component }>
                    <div ref={ this.boardRef } className="scrollChat">
                        { this.msgBoard.map((msg, index) => (<div key={ 'msg-' + index }>{ msg }</div>)) }
                    </div>
                    <div style={ this.styles.control.main }>
                        <div style={ this.styles.control.text.div }>
                            <TextArea autoFocus inputRef={ (ref) => ref ? ref.focus() : '' } growVertically onKeyPress={ this.keyHandler } onChange={ this.msgHandler } style={ this.styles.control.text.textarea } fill value={ this.state.message } />
                        </div>
                        <div style={ this.styles.control.button.div }>
                            <Button style={ this.styles.control.button.button } icon="send-message" onClick={ this.sendMessage } />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

}

export default Chat;