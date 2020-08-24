import React, { Component, CSSProperties } from 'react';
import { Card, Button, Classes, Icon, H5 } from '@blueprintjs/core';
import classnames from 'classnames';
import Links from './components/Links';
import Chat from './components/Chat';

interface IState {
	chat: boolean;
	show: boolean;
}

interface ILink {
	text: string;
	url: string;
}

interface IProps {
	endpoint: string;
	path?: string;
	title?: string;
	message?: string;
	position?: string;
	style?: CSSProperties;
	links?: ILink[];
}

interface IPositions {
	[index: string]: any;
}

const Positions: IPositions = {
	topRight: {
		top: '10px',
		right: '10px'
	},
	bottomRight: {
		bottom: '10px',
		right: '10px'
	},
	topLeft: {
		top: '10px',
		left: '10px'
	},
	bottomLeft: {
		bottom: '10px',
		left: '10px'
	}
};

class LiveChat extends Component<IProps, IState> {

	private style: CSSProperties;
	private links: ILink[];

	constructor(props: IProps) {
		super(props);

		this.state = {
			chat: false,
			show: false
		};
		
		this.style = {
			position: 'absolute',
			backgroundColor: 'white',
			bottom: '10px',
			right: '10px',
			borderRadius: '5px',
			height: '600px',
			width: '350px',
			overflow: 'auto'
		};

		this.links = props.links || [];

		if (props.position && Positions[props.position]) this.style = { ...this.style, ...Positions[props.position] };

		if (props.style) this.style = { ...this.style, ...props.style };

		this.startChat = this.startChat.bind(this);
		this.handleMenu = this.handleMenu.bind(this);
	}

	startChat() {
		this.setState({ chat: true });
	}

	handleMenu() {
		const { show } = this.state;
		this.setState({ show: !show });
	}

	get styles() {
		return {
			component: this.style,
			header: {
				div: {
					backgroundColor: '#394b59',
					height: '50px',
					display: 'flex',
					alignItems: 'center'
				},
				icon: {
					marginLeft: '15px'
				},
				h: {
					color: 'white',
					margin: '0px 0px 0px 15px',
					flex: 1
				},
				a: {
					style: {
						color: 'white'
					},
					icon: {
						margin: '10px'
					}
				},
			},
			card: {
				margin: '10px',
				backgroundColor: '#dfe9f5'
			},
			button: {
				a: {
					color: 'white'
				},
				div: {
					...this.style,
					width: '40px',
					height: '40px',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#394b59',
					color: 'white',
					borderRadius: '30px'
				}
			}
		};
	}

	get header(): JSX.Element {
		return (
			<div style={ this.styles.header.div }>
				<Icon style={ this.styles.header.icon } icon="help" color="white" iconSize={ 30 } />
				<H5 style={ this.styles.header.h }>{ this.props.title || 'Live Chat' }</H5>
				<a href="#!" style={ this.styles.header.a.style } onClick={ this.handleMenu }>
					<Icon style={ this.styles.header.a.icon } icon="minimize" color="white" iconSize={ 15 } />
				</a>
			</div>
		);
	}

	render() {
		const { chat, show } = this.state;
		const classesLiveChat = classnames('LiveChat', Classes.ELEVATION_4);

		if (show) {
			if (chat) {
				return (
					<div className={ classesLiveChat } style={ this.styles.component }>
						{ this.header }
						<Chat endpoint={ this.props.endpoint } path={ this.props.path } message={ this.props.message || 'Hello there! Need help?' } />
					</div>
				);
			}
			else {
				return (
					<div className={ classesLiveChat } style={ this.styles.component }>
						{ this.header }
						<Card style={ this.styles.card }>
						<Button icon="help" fill minimal onClick={ this.startChat }>{ this.props.message || 'Hello there! Need help?' }</Button>
						</Card>
						<Links links={ this.links } />
					</div>
				);
			}
		}
		else {
			return (
				<a href="#!" style={ this.styles.button.a } onClick={ this.handleMenu }>
					<div
						style={ this.styles.button.div }
					>
						<Icon icon="help" iconSize={ 20 } />
					</div>
				</a>
			);
		}
	}

}

export default LiveChat;
