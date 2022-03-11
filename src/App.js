import './App.css';
import WorldInfoTable from "./components/WorldInfoTable";
import Title from "./components/Title";
import Footer from "./components/Footer";
import React, {useEffect, useState} from "react";
import {compare} from "./dependencies/util";
import NavBar from "./components/NavBar/NavBar";

function App() {
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [jsonItems, setJsonItems] = useState([])

    useEffect(() => {
        fetch("https://togcrowdsourcing.com/worldinfo")
            .then(response => response.json())
            .then((result) => {
                setIsLoaded(true)
                setJsonItems(result.sort(compare))
            }, (error) => {
                setIsLoaded(true)
                setError(error)
            })
    }, [])

    if (error) {
        return <div>Error: {error.message}</div>
    }
    else if (!isLoaded) {
        return <div>Loading...</div>
    }
    else {

        return (
            <div className="App">
                {/*<Title className="app-title"/>*/}
                <NavBar classNamge='navbar' isLoaded={isLoaded}/>
                <WorldInfoTable className="world-info-table" jsonItems={jsonItems}/>
                {/*<Footer className="app-footer"/>*/}
            </div>
        );

    }
}

export default App;
