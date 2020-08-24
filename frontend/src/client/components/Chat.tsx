import React, { Component } from 'react';
import { TextArea, Button } from '@blueprintjs/core';
import socketIO from 'socket.io-client';
import Message from './Message';

interface IProps {
    endpoint: string;
    path?: string;
    message?: string;
}

interface IState {
    message: string;
    ticket: string;
    msgBoard: JSX.Element[];
}

class Chat extends Component<IProps, IState> {

    private socket: SocketIOClient.Socket;
    private msgRef: React.RefObject<HTMLTextAreaElement>;
    private boardRef: React.RefObject<HTMLDivElement>;
    private updatedBoard: number;

    constructor(props: IProps) {
        super(props);

        this.socket = {} as SocketIOClient.Socket;
        this.msgRef = React.createRef();
        this.boardRef = React.createRef();

        this.updatedBoard = 0;

        this.state = {
            message: '',
            ticket: '',
            msgBoard: [
                <Message assistant message={ props.message || 'Hello there! Need help?' } />
            ]
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
        let { message, ticket, msgBoard } = this.state;

        message = message.trim();

        if (message.length) {
            if (this.socket.connected && ticket.length) {
                this.socket.emit('chat', {
                    req: 'message',
                    message: {
                        id: ticket,
                        message: message
                    }
                });

                msgBoard.push(<Message message={ message } />);

                if (this.msgRef.current) this.msgRef.current.value = '';

                this.setState({ message: '', msgBoard: msgBoard });
            }
            else {
                this.socket = socketIO(this.props.endpoint, {
                    path: this.props.path
                });
        
                this.socket.on('connect', () => {
                    this.socket.on('message', (data: any) => {
                        const { message, opName } = data;
                        if (message && opName) msgBoard.push(<Message message={ message } assistantName={ opName } assistant={ true } />);

                        this.setState({ msgBoard: msgBoard });
                    });

                    this.socket.on('created', (data: { ticket: string }) => {
                        const { ticket } = data;
                        if (ticket) this.setState({ ticket: ticket });

                        this.socket.emit('chat', {
                            req: 'message',
                            message: {
                                id: ticket,
                                message: message
                            }
                        });

                        msgBoard.push(<Message message={ message } />);
    
                        if (this.msgRef.current) this.msgRef.current.value = '';
    
                        this.setState({ message: '', msgBoard: msgBoard });
                    });

                    this.socket.emit('chat', {
                        req: 'create'
                    });
                });
        
                this.socket.on('disconnect', () => {
                    console.log('Disconnected');
                });
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
                borderRadius: '5px',
                height: 'calc(100% - 50px - 10px)'
            },
            msgBoard: {
                flex: 1,
                margin: '5px',
                overflow: 'auto',
                maxHeight: '480px'
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
                        maxHeight: '50px'
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
        if (this.boardRef.current && this.boardRef.current.children.length !== this.updatedBoard) {
            this.boardRef.current.scrollTop = this.boardRef.current.scrollHeight;
            this.updatedBoard = this.boardRef.current.children.length;
        }
    }

    render() {
        const { ticket, msgBoard } = this.state;
        this.refreshBoard();

        return (
            <div style={ this.styles.component }>
                <div ref={ this.boardRef } style={ this.styles.msgBoard }>
                    { ticket.length ? 'Ticket: ' + ticket : '' }
                    { msgBoard.map((msg, index) => (<div key={ 'msg-' + index }>{ msg }</div>)) }
                </div>
                <div style={ this.styles.control.main }>
                    <div style={ this.styles.control.text.div }>
                        <TextArea inputRef={ (ref) => ref ? this.msgRef = React.createRef() : '' } growVertically onKeyPress={ this.keyHandler } onChange={ this.msgHandler } style={ this.styles.control.text.textarea } fill value={ this.state.message } />
                    </div>
                    <div style={ this.styles.control.button.div }>
                        <Button style={ this.styles.control.button.button } icon="send-message" onClick={ this.sendMessage } />
                    </div>
                </div>
            </div>
        );
    }

}

export default Chat;