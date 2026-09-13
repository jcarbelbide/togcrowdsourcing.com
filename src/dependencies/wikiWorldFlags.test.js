import {parseWorldFlags} from "./wikiWorldFlags";
import {compare} from "./util";

test("parses WorldLine entries and skips junk", () => {
    const flags = parseWorldFlags(
        "{{WorldLine|301|United States (east)|mems=no|Trade}}\n" +
        "{{WorldLine|303|Germany|mems=yes}}\n" +
        "{{WorldLine| 306 | United States (west) |mems=yes}}\n" +
        "{{WorldLine|305||mems=yes}}\n" +
        "<!-- {{WorldLine|746|Germany|mems=league}} -->"
    )
    expect(flags.size).toBe(3)
    expect(flags.get(306).location).toBe("United States (west)")
    expect(flags.has(746)).toBe(false)
    expect(flags.get(301)).toEqual({
        location: "United States (east)",
        flagUrl: "https://oldschool.runescape.wiki/images/United_States_(east)_flag.png",
    })
    expect(flags.get(303).location).toBe("Germany")
})

test("parse tolerates missing wikitext", () => {
    expect(parseWorldFlags(undefined).size).toBe(0)
})

test("compare: stream order group, then hits desc, then world number", () => {
    const rows = [
        {world_number: 2, hits: 5, stream_order: "bbbggg"},
        {world_number: 1, hits: 1, stream_order: "gggbbb"},
        {world_number: 9, hits: 50, stream_order: "bgbgbg"},
        {world_number: 4, hits: 7, stream_order: "gggbbb"},
        {world_number: 3, hits: 7, stream_order: "gggbbb"},
    ]
    expect(rows.sort(compare).map(r => r.world_number)).toEqual([3, 4, 1, 2, 9])
})
