import React from 'react';
import { bool } from 'prop-types';
import { StyledMenu } from './Menu.styled';
import {useWindowDimensions} from "../../../dependencies/util";

const Menu = ({ open, ...props }) => {

    const isHidden = open ? true : false;
    const tabIndex = isHidden ? 0 : -1;
    const { height, width } = useWindowDimensions();

    return (
        <StyledMenu open={open} aria-hidden={!isHidden} {...props}>
            <a tabIndex={tabIndex}>
                <span aria-hidden="true"></span>

            </a>
            <a href="https://github.com/jcarbelbide/tog-crowdsourcing-server" tabIndex={tabIndex}>
                <span aria-hidden="true"></span>
                API
            </a>
            <a href="https://github.com/jcarbelbide/tog-crowdsourcing" tabIndex={tabIndex}>
                <span aria-hidden="true"></span>
                Git
            </a>
        </StyledMenu>
    )
}

Menu.propTypes = {
    open: bool.isRequired,
}

export default Menu;