// Flags come from the OSRS wiki "World" page, which lists every world as
// {{WorldLine|301|United States (east)|...}} and renders "<Location> flag.png".
const WIKI_WORLD_PAGE_URL =
    "https://oldschool.runescape.wiki/api.php?action=parse&page=World&prop=wikitext&format=json&origin=*"
const WIKI_IMAGE_BASE_URL = "https://oldschool.runescape.wiki/images/"

const WORLD_LINE_REGEX = /\{\{WorldLine\|(\d+)\|([^|}]+)/g

function flagUrlForLocation(location) {
    return WIKI_IMAGE_BASE_URL + encodeURIComponent(location.replace(/ /g, "_") + "_flag.png")
}

// Pure parse step so it can be checked without a network call.
function parseWorldFlags(wikitext) {
    const flags = new Map()
    if (typeof wikitext !== "string") {
        return flags
    }
    for (const match of wikitext.matchAll(WORLD_LINE_REGEX)) {
        const worldNumber = Number(match[1])
        const location = match[2].trim()
        if (!Number.isInteger(worldNumber) || !location) {
            continue
        }
        flags.set(worldNumber, {location, flagUrl: flagUrlForLocation(location)})
    }
    return flags
}

// Resolves to Map<worldNumber, {location, flagUrl}>. Never rejects: any
// failure yields an empty Map so the site still renders without flags.
async function fetchWorldFlags() {
    try {
        const response = await fetch(WIKI_WORLD_PAGE_URL)
        if (!response.ok) {
            return new Map()
        }
        const json = await response.json()
        return parseWorldFlags(json?.parse?.wikitext?.["*"])
    } catch (e) {
        console.warn("Could not load world flags from the wiki", e)
        return new Map()
    }
}

export {parseWorldFlags, flagUrlForLocation}
export default fetchWorldFlags
