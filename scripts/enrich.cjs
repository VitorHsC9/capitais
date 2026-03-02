const fs = require('fs');

async function fetchCountries() {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,capital,cca2,cca3,translations');
    return res.json();
}

(async function main() {
    const restData = await fetchCountries();
    if (!Array.isArray(restData)) {
        console.error("API error, not an array", restData);
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

    code = code.replace(regex, (match, name, codeStr) => {
        const cCode = codeStr.toLowerCase();
        const restCountry = restMap[cCode];
        if (restCountry && !match.includes('acceptedNames:')) {
            const names = new Set();
            const capitals = new Set();

            if (restCountry.name && restCountry.name.common) names.add(restCountry.name.common);
            if (restCountry.name && restCountry.name.official) names.add(restCountry.name.official);
            if (restCountry.translations && restCountry.translations.por) {
                names.add(restCountry.translations.por.common);
                names.add(restCountry.translations.por.official);
            }

            const mapNameMatch = match.match(/mapName:\s*'([^']+)'/);
            if (mapNameMatch) names.add(mapNameMatch[1]);

            if (restCountry.capital && restCountry.capital.length > 0) {
                capitals.add(restCountry.capital[0]);
            }

            const capMatch = match.match(/capital:\s*'([^']+)'/);
            const origCap = capMatch ? capMatch[1] : '';

            const finalNames = [...names].filter(n => n && n.toLowerCase() !== name.toLowerCase());
            const finalCaps = [...capitals].filter(c => c && c.toLowerCase() !== origCap.toLowerCase());

            const addNames = finalNames.length > 0 ? `\n    acceptedNames: ${JSON.stringify(finalNames)},` : '';
            const addCaps = finalCaps.length > 0 ? `\n    acceptedCapitals: ${JSON.stringify(finalCaps)},` : '';

            return match.replace(new RegExp(`code:\\s*'${codeStr}',`), `code: '${codeStr}',${addNames}${addCaps}`);
        }
        return match;
    });

    fs.writeFileSync('./src/data/countries.ts', code, 'utf-8');
    console.log('Enriched!');
})();
