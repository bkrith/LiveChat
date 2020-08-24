import React from 'react';
import { Icon } from '@blueprintjs/core';

const styles = {
    mainStyle: {
        display: 'flex',
        flexDirection: 'row' as 'row',
        justifyContent: 'start',
        overflowWrap: 'anywhere' as 'anywhere'
    },
    iconStyle: {
        backgroundColor: '#45a4ec',
        height: '30px',
        minWidth: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '15px 0px 15px 15px'
    },
    msgStyle: {
        marginLeft: '5px',
        marginRight: '0px',
        backgroundColor: '#eeeeee',
        borderRadius: '0px 15px 15px 15px',
        padding: '10px'
    }
};

const Message = ({ assistant, message, assistantName }: { assistant?: boolean, message: string, assistantName?: string }) => {
    if (!assistant) {
        styles.iconStyle = {
            ...styles.iconStyle,
            borderRadius: '0px 15px 15px 15px'
        };

        styles.msgStyle = {
            ...styles.msgStyle,
            borderRadius: '15px 0px 15px 15px',
            marginLeft: '0px',
            marginRight: '5px'
        };

        styles.mainStyle = {
            ...styles.mainStyle,
            justifyContent: 'flex-end'
        };
    }
    else {
        styles.iconStyle = {
            ...styles.iconStyle,
            borderRadius: '15px 0px 15px 15px'
        };

        styles.msgStyle = {
            ...styles.msgStyle,
            borderRadius: '0px 15px 15px 15px',
            marginLeft: '5px',
            marginRight: '0px'
        };

        styles.mainStyle = {
            ...styles.mainStyle,
            justifyContent: 'start'
        };
    }

    const iconElement = <div style={ styles.iconStyle }><Icon color="white" icon="help" iconSize={20} /></div>;

    const msgElement = <div style={ styles.msgStyle }>
        {
            message.split(/(?:\r\n|\r|\n)/g).map((item, key) => {
                return <span key={ key }>{ item }<br/></span>
            })
        }
    </div>;;

    return (
        <div style={{ flexDirection: 'column', marginTop: '10px' }}>
            <span style={{ fontSize: '10px', marginLeft: '35px' }}>{ assistantName }</span>
            <div style={ styles.mainStyle }>
                { assistant ? iconElement : msgElement }
                { assistant ? msgElement : '' }
            </div>
        </div>
    );
};

export default Message;