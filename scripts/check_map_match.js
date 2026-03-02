
import fs from 'fs';
import https from 'https';

// Mock the countries data since we can't easily import TS directly in JS without build
// I will copy the structure of one country to test, or better, I will read the file and extract names
// Actually, I can just use the list I saw in view_file. 
// To be more robust, I'll fetch the GeoJSON first, then check against a hardcoded list of "suspect" countries 
// or just the daily one if I can calculate it.

// Let's replicate the daily logic to find TODAY's country.
const seededRandom = (seed) => {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));

    return () => {
        state = (a * state + c) % m;
        return state / (m - 1);
    };
};

const getDailySeed = () => {
    const now = new Date();
    const baseSeed = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return baseSeed;
}

const getDailyCountryIndex = (totalCountries, salt = 0) => {
    const now = new Date();
    let seedString = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
        seed = ((seed << 5) - seed) + seedString.charCodeAt(i);
        seed |= 0;
    }
    seed += salt;

    const random = seededRandom(seed);
    const randomIndex = Math.floor(random() * totalCountries);
    return randomIndex;
};

// URL for GeoJSON
const GEOJSON_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

// Fetch GeoJSON
https.get(GEOJSON_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const geoJson = JSON.parse(data);
        console.log(`GeoJSON loaded with ${geoJson.features.length} features.`);

        // We need to read countries.ts to get the list. 
        // Since it's TS, I'll read it as text and extract the names using regex for simplicity in this script.
        const countriesContent = fs.readFileSync('src/data/countries.ts', 'utf8');

        // Regex to extract objects. This is a bit hacky but should work for this file structure.
        // We look for name: '...', mapName: '...', code: '...'
        const countryMatches = [];
        const regex = /name:\s*'([^']+)',\s*mapName:\s*'([^']*)',/g;
        let match;
        while ((match = regex.exec(countriesContent)) !== null) {
            countryMatches.push({
                name: match[1],
                mapName: match[2]
            });
        }

        console.log(`Found ${countryMatches.length} countries in source code.`);

        // Calculate today's country
        // Salt for Map is 3 (from useDailyMap.ts)
        const dailyIndex = getDailyCountryIndex(countryMatches.length, 3);
        const dailyCountry = countryMatches[dailyIndex];

        console.log(`Today's Daily Map Country (Index ${dailyIndex}):`, dailyCountry);

        // Check if it matches
        const targetName = dailyCountry.mapName || dailyCountry.name;

        const feature = geoJson.features.find((f) => {
            const props = f.properties || {};
            const name = props.name || '';
            // We don't have code in this simple extraction, but let's check name match
            return name.toLowerCase() === targetName.toLowerCase();
        });

        if (feature) {
            console.log("SUCCESS: Found matching feature in GeoJSON:", feature.properties.name);
        } else {
            console.error("FAILURE: Could NOT find matching feature in GeoJSON for:", targetName);

            // Try to find close matches
            console.log("Did you mean one of these?");
            geoJson.features.forEach(f => {
                if (f.properties.name.toLowerCase().includes(targetName.toLowerCase()) ||
                    targetName.toLowerCase().includes(f.properties.name.toLowerCase())) {
                    console.log(`- ${f.properties.name} (ID: ${f.id})`);
                }
            });
        }

    });
}).on('error', (err) => {
    console.error("Error fetching GeoJSON:", err);
});
