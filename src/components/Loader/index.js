import React from 'react';
import "./style.css";

const Loader = (props) => {
    return(<div className="Loader">
        <div className="lds-default">
            <div key="1"></div>
            <div key="2"></div>
            <div key="3"></div>
            <div key="4"></div>
            <div key="5"></div>
            <div key="6"></div>
            <div key="7"></div>
            <div key="8"></div>
            <div key="9"></div>
            <div key="10"></div>
            <div key="11"></div>
            <div key="12"></div>
        </div>
    </div>);
}

export default Loader;