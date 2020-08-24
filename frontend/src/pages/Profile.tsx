import React, { Component } from 'react';
import { Card, H5, Intent } from '@blueprintjs/core';
import MyForm from '../components/MyForm';
import myToaster from '../components/MyToaster';
import { ISocketSendData } from '../components/LiveSocket';
import { connector, PropsFromRedux } from '../store/Connector';

interface IProps {
    send: (event: string, data: ISocketSendData) => void;
}

type IFinalProps = PropsFromRedux & IProps;

class Profile extends Component<IFinalProps> {

    private form: any;

    constructor(props: IFinalProps) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.form = {
            onSubmit: this.handleSubmit,
            errors: {
                email: null,
                name: null,
                password: null
            },
            inputs: {
                email: {
                    settings: {
                        id: 'emailInput',
                        name: 'email',
                        type: 'email',
                        placeholder: 'E-mail',
                        leftIcon: 'envelope'
                    },
                    default: props.user.email,
                    validation: (value: string) => {
                        const validEmailRegex = RegExp(/^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                        return validEmailRegex.test(value) ? null : 'E-mail is not valid!';
                    }
                },
                name: {
                    settings: {
                        id: 'nameInput',
                        name: 'name',
                        type: 'text',
                        placeholder: 'Name',
                        leftIcon: 'user'
                    },
                    default: props.user.name,
                    validation: (value: string) => ((value.length < 5) ? 'Name must be at least 5 characters long!' : null)
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
                    text: 'Save'
                }
            ]
        };
    }

    private handleSubmit(values: any) {
        const { email, name, password } = values;

        if (email && name && password) {
            this.props.send('auth', {
                req: 'update',
                message: {
                    email: email,
                    name: name,
                    password: password
                }
            });
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
        this.form.inputs.email.default = this.props.user.email;
        this.form.inputs.name.default = this.props.user.name;

        return (
            <div
                className="container-center"
                style={{
                    flex: 1,
                    textAlign: 'center',
                    marginTop: '10px'
                }}
            >
                <Card elevation={ 4 } interactive={ false }>
                    <H5>
                        Profile
                    </H5>
                    <div>
                        { this.props.user.email ? <MyForm settings={ this.form } /> : '' }
                    </div>
                </Card>
            </div>
        );
    }

}

export default connector(Profile);