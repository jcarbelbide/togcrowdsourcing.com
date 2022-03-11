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

export default compare;
