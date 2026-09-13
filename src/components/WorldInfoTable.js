import React from 'react';
import WorldInfoRow from "./WorldInfoRow";

function WorldInfoTable(props) {
    let jsonItems = props.jsonItems
    let flags = props.flags || new Map()

    if (jsonItems == null || jsonItems.length === 0) {
        return (
            getTable(flags, [{
                world_number: '-',
                hits: '-',
                stream_order: 'No data!'
            }])
        )
    }
    else {
        return (
            getTable(flags, jsonItems)
        )
    }
}

function getTable(flags, jsonItems) {
    return (
        <table className="container">
            <thead>
            <tr>
                <th className='world-number-header'><h1>World Number</h1></th>
                <th className='hits-header'><h1>Hits</h1></th>
                <th className='stream-order-header'><h1>Stream Order</h1></th>
            </tr>
            </thead>
            <tbody>
            {jsonItems.map( (item, index) => (
                <WorldInfoRow key={item.world_number} flag={flags.get(item.world_number)} world_number={item.world_number} hits={item.hits} stream_order={item.stream_order} rowClass={index % 2 === 0 ? "even-row" : "odd-row"}/>
            ))}
            </tbody>
        </table>
    )
}

export default WorldInfoTable;
