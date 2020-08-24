export interface ISocket extends SocketIO.Socket {
    ticketId: string;
    operator: boolean;
    userId: string;
}

export interface IScokets {
    [id: string]: ISocket;
}
