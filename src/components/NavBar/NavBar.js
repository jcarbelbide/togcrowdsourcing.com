import React, {useEffect, useRef, useState} from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import {Burger} from "./index";
import Menu from "./Menu";
import {useOnClickOutside} from "../../dependencies/util";

function NavBar(props) {
    const [navbarOpen, setNavbarOpen] = useState(false)
    const node = useRef()
    useOnClickOutside(node, () => setNavbarOpen(false))

    if (!props.isLoaded) { return }

    return (
        <ThemeProvider theme={theme}>
            <div ref={node}>
                <Burger open={navbarOpen} setOpen={setNavbarOpen}/>
                <Menu open={navbarOpen} setOpen={setNavbarOpen}/>
            </div>
        </ThemeProvider>
    )
}

export default NavBar;
