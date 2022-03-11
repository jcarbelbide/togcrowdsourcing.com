import { useState, useEffect } from 'react';

function compare(a, b) {
    // console.log(a.stream_order, b.stream_order, a.stream_order > b.stream_order)
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

const useOnClickOutside = (ref, handler) => {
    useEffect(() => {
            const listener = event => {
                if (!ref.current || ref.current.contains(event.target)) {
                    return;
                }
                handler(event);
            };
            document.addEventListener('mousedown', listener);
            return () => {
                document.removeEventListener('mousedown', listener);
            };
        },
        [ref, handler],
    );
};

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}

export {
    compare,
    useOnClickOutside,
    useWindowDimensions
}
