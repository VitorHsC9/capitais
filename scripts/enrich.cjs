const fs = require('node:fs');

async function fetchCountries() {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,cca2,cca3,translations');
    return res.json();
}

(async function main() {
    const restData = await fetchCountries();
    if (!Array.isArray(restData)) {
        console.error("API error: expected a countries array");
        return;
    }
    const restMap = {};
    for (const c of restData) {
        if (c.cca2) restMap[c.cca2.toLowerCase()] = c;
        if (c.cca3) restMap[c.cca3.toLowerCase()] = c;
    }

    let code = fs.readFileSync('./src/data/countries.ts', 'utf-8');

    if (!code.includes('acceptedNames?')) {
        code = code.replace(
            'mapName?: string; // Nome em inglês para o mapa (GeoJSON)',
            'mapName?: string; // Nome em inglês para o mapa (GeoJSON)\n  acceptedNames?: string[];\n  acceptedCapitals?: string[];'
        );
    }

    // Regex matches each country object
    const regex = /{\s*name:\s*'([^']+)'[\s\S]*?code:\s*'([^']+)'[\s\S]*?},/g;

    const collectAcceptedNames = (restCountry, match) => {
        const names = new Set([
            restCountry.name?.common,
            restCountry.name?.official,
            restCountry.translations?.por?.common,
            restCountry.translations?.por?.official,
        ].filter(Boolean));

        const mapNameMatch = /mapName:\s*'([^']+)'/.exec(match);
        if (mapNameMatch) names.add(mapNameMatch[1]);
        return names;
    };

    const collectAcceptedCapitals = (restCountry) => {
        const capitals = new Set();
        if (restCountry.capital?.length > 0) {
            capitals.add(restCountry.capital[0]);
        }
        return capitals;
    };

    code = code.replace(regex, (match, name, codeStr) => {
        const cCode = codeStr.toLowerCase();
        const restCountry = restMap[cCode];
        if (restCountry && !match.includes('acceptedNames:')) {
            const names = collectAcceptedNames(restCountry, match);
            const capitals = collectAcceptedCapitals(restCountry);

            const capMatch = /capital:\s*'([^']+)'/.exec(match);
            const origCap = capMatch ? capMatch[1] : '';

            const finalNames = [...names].filter(n => n && n.toLowerCase() !== name.toLowerCase());
            const finalCaps = [...capitals].filter(c => c && c.toLowerCase() !== origCap.toLowerCase());

            const addNames = finalNames.length > 0 ? `\n    acceptedNames: ${JSON.stringify(finalNames)},` : '';
            const addCaps = finalCaps.length > 0 ? `\n    acceptedCapitals: ${JSON.stringify(finalCaps)},` : '';

            return match.replace(new RegExp(String.raw`code:\s*'${codeStr}',`), `code: '${codeStr}',${addNames}${addCaps}`);
        }
        return match;
    });

    fs.writeFileSync('./src/data/countries.ts', code, 'utf-8');
    console.log('Enriched!');
})();
