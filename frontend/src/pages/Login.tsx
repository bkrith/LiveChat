import React, { Component } from 'react';
import { Card, H5, Intent } from '@blueprintjs/core';
import MyForm from '../components/MyForm';
import myToaster from '../components/MyToaster';
import { ISocketSendData } from '../components/LiveSocket';

interface IProps {
    send: (event: string, data: ISocketSendData) => void;
}

class Login extends Component<IProps> {

    private form: any;

    constructor(props: IProps) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.form = {
            onSubmit: this.handleSubmit,
            errors: {
                email: null,
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
                        intent: Intent.PRIMARY
                    },
                    text: 'Login'
                }
            ]
        };
    }

    private handleSubmit(values: any) {
        const { email, password } = values;

        if (email && password) {
            this.props.send('login', {
                req: 'login',
                message: {
                    email: email,
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
                        Login
                    </H5>
                    <div>
                        <MyForm settings={ this.form } />
                    </div>
                </Card>
            </div>
        );
    }

}

export default Login;