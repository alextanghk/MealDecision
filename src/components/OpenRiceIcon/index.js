import React from 'react';
import {ReactComponent as MyLogo} from './logo.svg';
import { SvgIcon } from '@material-ui/core';

const OpenRiceIcon = (props) => {
    return(
        <SvgIcon {...props} component={MyLogo} />
    );
}

export default OpenRiceIcon;