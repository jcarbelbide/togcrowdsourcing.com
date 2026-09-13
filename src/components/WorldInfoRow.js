import React from 'react';

function WorldInfoRow(props) {
    let streamOrderClass
    if (props.stream_order === "gggbbb") {
        streamOrderClass = "gggbbb-class"
    }
    else if (props.stream_order === "bbbggg") {
        streamOrderClass = "bbbggg-class"
    }
    return (
        <tr className={props.rowClass}>
            <td>
                {props.flag && (
                    <img className="world-flag"
                         src={props.flag.flagUrl}
                         alt={props.flag.location}
                         title={props.flag.location}
                         onError={e => { e.currentTarget.hidden = true }}/>
                )}
                {props.world_number}
            </td>
            <td> {props.hits} </td>
            <td className={streamOrderClass}> {props.stream_order} </td>
        </tr>
    )
}

export default WorldInfoRow;
