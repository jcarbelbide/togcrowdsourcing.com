import React, {useEffect, useRef, useState} from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import {Burger} from "./index";
import Menu from "./Menu";
import {useOnClickOutside} from "../../dependencies/util";

// Most code borrowed from https://css-tricks.com/hamburger-menu-with-a-side-of-react-hooks-and-styled-components/
// Git located here: https://github.com/maximakymenko/react-burger-menu-article-app
// Code has been modified slightly, but all credit should go to maximakymenko on Github.
// His Github profile found here: https://github.com/maximakymenko
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
