import React, {useEffect, useState} from 'react';
import WorldInfoRow from "./WorldInfoRow";

function WorldInfoTable(props) {
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [jsonItems, setJsonItems] = useState([])
    const [rows, setRows] = useState([])

    function compare(a, b) {
        console.log(a.stream_order, b.stream_order, a.stream_order > b.stream_order)
        if (a.stream_order === "gggbbb") {
            if (b.stream_order === "gggbbb") {
                return 0
            }
            else {
                return -1
            }
        }
        if (a.stream_order === "bbbggg") {
            if (b.stream_order === "gggbbb") {
                return 1
            }
            else if (b.stream_order === "bbbggg") {
                return 0
            }
            else {
                return -1
            }
        }
        return a.world_number - b.world_number
    }

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
        if (jsonItems == null) {
            return <div>No Data!</div>
        }
        return (
            <table className="container">
                <thead>
                <tr>
                    <th><h1>World Number</h1></th>
                    <th><h1>Hits</h1></th>
                    <th><h1>Stream Order</h1></th>
                </tr>
                </thead>
                <tbody>
                {jsonItems.map( (item, index) => (
                    <WorldInfoRow world_number={item.world_number} hits={item.hits} stream_order={item.stream_order} rowClass={index % 2 === 0 ? "even-row" : "odd-row"}/>
                    ) )}
                </tbody>
            </table>
        )
    }

    // return (
    //     <div>
    //         <WorldInfoRow worldNumber={1}/>
    //     </div>
    // )
}

export default WorldInfoTable;
