import React, { Component } from 'react';
import NavBar from './components/NavBar';
import { Switch, Route, Redirect, withRouter, RouteComponentProps } from 'react-router-dom';
import Login from './pages/Login';
import Users from './pages/Users';
import Tickets from './pages/Tickets';
import Home from './pages/Home';
import Dash from './pages/Dash';
import NotFound from './pages/NotFound';
import SuperDialog from './dialogs/SuperDialog';
import './styles/LiveChatDash.css';
import '../node_modules/normalize.css';
import '../node_modules/@blueprintjs/core/lib/css/blueprint.css';
import '../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css';
import '../node_modules/@blueprintjs/table/lib/css/table.css';
import LiveChat from './client/LiveChat';
import { FocusStyleManager } from '@blueprintjs/core';
import LiveSocket from './components/LiveSocket';
import { connector, PropsFromRedux } from './store/Connector';
import Profile from './pages/Profile';

FocusStyleManager.onlyShowFocusOnTabs();

interface IProps extends RouteComponentProps {
	endpoint: string;
	path: string;
}

const isAuthenticated = (): boolean => {
	const token = localStorage.getItem('token');

	try {
		if (token) {
			const dec = JSON.parse(atob(token.split('.')[1]));

			if (dec && dec.exp && Date.now() < (dec.exp * 1000)) return true;

			localStorage.clear();

			return false;
		}
	}
	catch (error) {
		localStorage.clear();
	}

	localStorage.clear();
	
	return false;
};

type Props = PropsFromRedux & IProps;

class LiveChatDash extends Component<Props> {

	private socket: LiveSocket;

	constructor(props: Props) {
		super(props);

		this.socket = {} as LiveSocket;

		try {
			this.connect();
		}
		catch (error) {
			// Do nothing
		}
	}

	connect() {
		this.socket= new LiveSocket(this.props.endpoint, this.props.path);
		this.socket.token = localStorage.getItem('token');
	}

	render() {
		if (this.props.firstTime) {
			return (
				<SuperDialog
					send={ this.socket.emit.bind(this) }
					settings={{
						autoFocus: true,
						canEscapeKeyClose: false,
						canOutsideClickClose: false,
						enforceFocus: true,
						hasBackdrop: true,
						isOpen: true,
						usePortal: false,
						useTallContent: false,
					}}
				/>
			);
		}
		else {
			return (
				<main className="liveChat">
					<NavBar isAuthenticated={ isAuthenticated } />
					<Switch>
						<Route path="/login" component={ () => (isAuthenticated() ? <Redirect to="/dash" /> : <Login send={ this.socket.emit.bind(this) } />) } />
						<Route path="/" component={ Home } exact />
						<Route path="/profile" render={ () => (isAuthenticated() ? <Profile send={ this.socket.emit.bind(this) } /> : <Redirect to="/login" />) } />
						<Route path="/dash" render={ () => (isAuthenticated() ? <Dash /> : <Redirect to="/login" />) } exact />
						<Route path="/admins" render={ () => (isAuthenticated() ? <Users send={ this.socket.emit.bind(this) } role={ 2 } /> : <Redirect to="/login" />) } />
						<Route path="/operators" render={ () => (isAuthenticated() ? <Users send={ this.socket.emit.bind(this) } role={ 1 } /> : <Redirect to="/login" />) } />
						<Route path="/tickets" render={ () => (isAuthenticated() ? <Tickets send={ this.socket.emit.bind(this) } /> : <Redirect to="/login" />) } />
						<Route path="/notfound" component={ NotFound } />
						<Route path="/*" render={ () => (<Redirect to="/notfound" />) } />
					</Switch>
					<LiveChat
						links={
							[
								{
									text: 'kalimera1',
									url: 'https://google.com'
								},
								{
									text: 'kalimera1',
									url: 'https://google.com'
								}
							]
						}
						endpoint="https://localhost:5000"
						path="/livechat"
					/>
				</main>
			);
		}
	}

}

export default withRouter(connector(LiveChatDash));
