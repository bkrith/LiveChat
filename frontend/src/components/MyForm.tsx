import React, { useState } from 'react';
import { Classes, FormGroup, InputGroup, Button } from '@blueprintjs/core';

interface IMyForm {
    onSubmit: any;
    errors: any;
    inputs: any;
    buttons: any;
}

const MyForm = ({ settings }: { settings: IMyForm }) => {

    const [ errors, setErrors ] = useState(settings.errors);
    const initialValues: any = {};
    Object.keys(settings.inputs).forEach((name: string) => initialValues[name] = (settings.inputs[name].default || ''));

    const [ values, setValues ] = useState<any>({ ...initialValues });
    const inputs = settings.inputs;
    const buttons = settings.buttons;

    const handleChange = (event: React.FormEvent<HTMLInputElement>, validation: any) => {
        const { name, value } = event.currentTarget;

        setErrors({ ...errors, [name]: validation(value) });
        setValues({ ...values, [name]: value });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        let errored = false;

        Object.keys(errors).forEach((error) => errored = errors[error] ? true : false);

        if (!errored) settings.onSubmit(values);

        setValues({ ...initialValues });
    };

    return (
        <form onSubmit={ handleSubmit }>
            <div className={ Classes.DIALOG_BODY }>
                {
                    Object.keys(inputs).map((name: any, index: number) => (
                        <FormGroup
                            key={ 'input-' + index }
                            helperText={ errors[name] }
                            labelFor={ inputs[name] }
                            style={{ color: errors[name] ? 'red' : '' }}
                        >
                            <InputGroup style={{ color: errors[name] ? 'red' : '' }} value={ values[name] } onChange={ (event: React.FormEvent<HTMLInputElement>) => handleChange(event, inputs[name].validation) } { ...inputs[name].settings } />
                        </FormGroup>
                    ))
                }
                <div className="alignRight">
                    {
                        buttons.map((button: any, index: number) => (
                            <Button key={ 'button-' + index } { ...button.settings }>{ button.text }</Button>
                        ))
                    }
                </div>
            </div>
        </form>
    );

};

export default MyForm;