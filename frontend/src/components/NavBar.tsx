import React from 'react';
import { Alignment, Navbar, NavbarDivider, NavbarHeading, NavbarGroup, Button } from '@blueprintjs/core';
import { IoMdPeople, IoIosPeople, IoMdBookmarks, IoMdLogIn, IoMdLogOut } from 'react-icons/io';
import { Link, useLocation, useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { connector, PropsFromRedux } from '../store/Connector';

type Props = PropsFromRedux & { isAuthenticated: () => boolean };

const NavBar = ({ isAuthenticated, user }: Props) => {
	const location = useLocation();
	const history = useHistory();
	const board = location.pathname.split('/')[1];
	let contentLeft: JSX.Element[], contentRight: JSX.Element[];

	const logOut = () => {
		localStorage.clear();
		history.push('/login');
	};

	const toProfile = () => {
		history.push('/profile');
	};

	const iconStyle = classnames(
		'react-icons',
		'iconMarginRight'
	);

	contentLeft = [
		<Link key="navbarMenu2" to="/admins"><Button minimal active={ board === 'admins' ? true : false }><IoMdPeople className={ iconStyle } size="20" />Admins</Button></Link>,
		<Link key="navbarMenu3" to="/operators"><Button minimal active={ board === 'operators' ? true : false }><IoIosPeople className={ iconStyle } size="20" />Operators</Button></Link>,
		<Link key="navbarMenu4" to="/tickets"><Button minimal active={ board === 'tickets' ? true : false }><IoMdBookmarks className={ iconStyle } size="20" />Tickets</Button></Link>
	];

	contentRight = [
		<Link key="navbarMenu1" to="/login"><Button minimal active={ board === 'login' ? true : false }><IoMdLogIn className="react-icons" size="20" />Login</Button></Link>
	];

	return (
		<Navbar style={{ flexShrink: 0 }} className="bp3-dark">
			<NavbarGroup align={ Alignment.LEFT }>
				<NavbarHeading><Link to="/dash">LiveChat</Link></NavbarHeading>
				<NavbarDivider />
				{ isAuthenticated() ? contentLeft : '' }
			</NavbarGroup>
			<NavbarGroup align={ Alignment.RIGHT }>
				{ 
					isAuthenticated()
					? <div>
						<Button minimal onClick={ toProfile }>{ user.name }</Button>
						<Button minimal onClick={ logOut }><IoMdLogOut className="react-icons" size="20" /></Button>
					</div>
					: contentRight 
				}
			</NavbarGroup>
		</Navbar>
	);
}

export default connector(NavBar);