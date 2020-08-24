import React from 'react';
import { Card, H5, AnchorButton } from '@blueprintjs/core';

const Links = ({ links }: { links: { text: string, url: string }[] }) => {
    if (links.length) {
        return (
            <Card style={{ margin: '10px' }}>
                <H5>
                    FAQs
                </H5>
                <p>
                    { links.map((link, index) => {
                        return (<AnchorButton large icon="bookmark" key={ 'liveChatLink-' + index } href={ link.url } fill minimal alignText="left">{ link.text }</AnchorButton>);
                    }) }
                </p>
            </Card>
        );
    }
    
    return (<></>);
};

export default Links;