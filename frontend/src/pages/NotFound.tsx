import React from 'react';
import { IoMdSad } from 'react-icons/io';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container-center">
            <div className="myColorFg" style={{ fontSize: '30px', fontWeight: 'bold', textAlign: 'center' }}>
                <p><IoMdSad className="react-icons" size="60" /><br />Oups!!</p>
                <p>Please return to <Link to="/">Home</Link></p>
            </div>
        </div>
    );
};

export default NotFound;