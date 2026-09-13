import { useState, useEffect } from 'react';

const STREAM_ORDER_RANK = {gggbbb: 0, bbbggg: 1}

// gggbbb worlds first, then bbbggg, then everything else; most hits first
// within a group; world number as the final tiebreaker.
function compare(a, b) {
    const rankA = STREAM_ORDER_RANK[a.stream_order] ?? 2
    const rankB = STREAM_ORDER_RANK[b.stream_order] ?? 2
    return rankA - rankB || b.hits - a.hits || a.world_number - b.world_number
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
