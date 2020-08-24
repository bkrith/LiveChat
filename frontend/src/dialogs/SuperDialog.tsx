import React, { Component } from 'react';
import { Dialog, Intent } from '@blueprintjs/core';
import MyForm from '../components/MyForm';
import myToaster from '../components/MyToaster';
import { ISocketSendData } from '../components/LiveSocket';

interface IDialog {
    autoFocus?: boolean;
    canEscapeKeyClose?: boolean;
    canOutsideClickClose?: boolean;
    enforceFocus?: boolean;
    hasBackdrop?: boolean;
    isOpen?: boolean;
    usePortal?: boolean;
    useTallContent?: boolean;
}

interface IProps {
    send: (event: string, data: ISocketSendData) => void;
    settings: IDialog;
}

class SuperDialog extends Component<IProps, IDialog> {

    constructor(props: IProps) {
        super(props);

        this.state = this.props.settings;

		this.handleSubmit = this.handleSubmit.bind(this);
    }

    private handleSubmit(values: any) {
        const { name, email, password } = values;

        if (name && email && password) {
            this.props.send('superAdmin', {
                req: 'new',
                message: {
                    name: name,
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

		let { isOpen } = this.state;

		isOpen = false;

		this.setState({ isOpen: isOpen });
	}

    render() {
		const form = {
            onSubmit: this.handleSubmit,
            errors: {
				name: null,
                email: null,
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
                    text: 'Save'
                }
            ]
		};

        return (
			<Dialog
				icon="log-in"
				title="Create Super Administrator"
				{ ...this.state }
			>
				<MyForm settings={ form } />
			</Dialog>
		);
    }

}

export default SuperDialog;