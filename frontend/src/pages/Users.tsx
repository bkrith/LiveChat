import React, { Component } from 'react';
import { Card, H5, Icon, Button, Intent } from '@blueprintjs/core';
import { ISocketSendData } from '../components/LiveSocket';
import { connector, PropsFromRedux } from '../store/Connector';
import classnames from 'classnames';
import { IUser } from '../store/reducer';
import MyForm from '../components/MyForm';
import myToaster from '../components/MyToaster';

const headerTD = classnames([
    'tableHeader',
    'tableTD'
]);

interface IProps {
    send: (event: string, data: ISocketSendData) => void;
    role: number;
}

interface IState {
    showAdd: boolean;
}

class Users extends Component<PropsFromRedux & IProps, IState> {

    private form: any;

    constructor(props: PropsFromRedux & IProps) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.form = {
            onSubmit: this.handleSubmit,
            errors: {
                email: null,
                name: null,
                password: null
            },
            inputs: {
                name: {
                    settings: {
                        id: 'nameInput',
                        name: 'name',
                        type: 'text',
                        placeholder: 'Name',
                        leftIcon: 'user'
                    },
                    validation: (value: string) => ((value.length < 5) ? 'Name must be at least 5 characters long!' : null)
                },
                email: {
                    settings: {
                        id: 'emailInput',
                        name: 'email',
                        type: 'email',
                        placeholder: 'E-mail',
                        leftIcon: 'envelope'
                    },
                    validation: (value: string) => {
                        const validEmailRegex = RegExp(/^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                        return validEmailRegex.test(value) ? null : 'E-mail is not valid!';
                    }
                },
                password: {
                    settings: {
                        id: 'passwordInput',
                        name: 'password',
                        type: 'password',
                        placeholder: 'Password',
                        leftIcon: 'key'
                    },
                    validation: (value: string) => ((value.length < 8) ? 'Password must be at least 8 characters long!' : null)
                }
            },
            buttons: [
                {
                    settings: {
                        type: 'submit',
                        intent: Intent.SUCCESS
                    },
                    text: 'Add'
                }
            ]
        };

        this.state = {
            showAdd: false
        };
    }

    private handleClick(id: string) {
        this.props.send('auth', {
            req: 'remove',
            message: id
        });
    }

    private handleSubmit(values: any) {
        const { email, name, password } = values;

        if (email && name && password) {
            this.props.send('auth', {
                req: 'new',
                message: {
                    email: email,
                    name: name,
                    password: password,
                    role: this.props.role
                }
            });

            this.setState({ showAdd: false });
        }
        else {
            myToaster.show({
                icon: "error",
                intent: Intent.WARNING,
                message: "Missing fields!",
            });
        }
    }

    render() {
        const { operators, admins, role, user } = this.props;
        const { showAdd } = this.state;
        const logUser = user;

        let users: IUser[];

        if (role === 1) users = operators;
        else users = admins;

        return (
            <div className="container-center">
                <Card elevation={ 4 } interactive={ false }>
                    <H5>
                        <Button small minimal icon="new-person" onClick={ (event: React.MouseEvent) => this.setState({ showAdd: !showAdd }) }>Add { role === 1 ? 'Operator' : 'Admin'}</Button>
                    </H5>
                    <div className={ showAdd ? '' : 'hideMe' }><MyForm settings={ this.form } /></div>
                    <div>
                        <div className="tableRow">
                            <div className={ headerTD } style={{ width: '100%', minWidth: '50px' }}></div>
                            <div className={ headerTD } style={{ width: '100%', minWidth: '200px' }}>ID</div>
                            <div className={ headerTD } style={{ width: '100%', minWidth: '150px' }}>Name</div>
                            <div className={ headerTD } style={{ width: '100%', minWidth: '150px' }}>E-mail</div>
                            <div className={ headerTD } style={{ width: '100%', minWidth: '100px' }}></div>
                        </div>
                        <div>
                            { users.map((user: IUser, index: number) => (
                                <div className="tableRow" key={ 'userRow-' + index } id={ user._id }>
                                    <div className="tableTD" style={{ width: '100%', minWidth: '50px', textAlign: 'center' }}>{ index + 1 }</div>
                                    <div className="tableTD" style={{ width: '100%', minWidth: '200px' }}>{ user._id }</div>
                                    <div className="tableTD" style={{ width: '100%', minWidth: '150px' }}>{ user.name }</div>
                                    <div className="tableTD" style={{ width: '100%', minWidth: '150px' }}>{ user.email }</div>
                                    <div className="tableTD" style={{ width: '100%', minWidth: '100px' }}>
                                        <Icon icon="globe" color={ user.online ? 'green' : 'red' } />
                                        { (logUser.role > role) ? <Button small minimal icon="cross" onClick={ (event: React.MouseEvent) => this.handleClick(user._id) } /> : '' }
                                    </div>
                                </div>
                            )) }
                        </div>
                        <div className="tableRow"></div>
                    </div>
                </Card>
            </div>
        );
    }

}

export default connector(Users);