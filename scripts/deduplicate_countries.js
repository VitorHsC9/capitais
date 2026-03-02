import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current file
const countriesPath = path.join(__dirname, 'src/data/countries.ts');
const content = fs.readFileSync(countriesPath, 'utf8');

// Extract the array content
const match = content.match(/export const COUNTRIES_DB: Country\[\] = \[([\s\S]*)\];/);
if (!match) {
    console.error('Could not find COUNTRIES_DB array');
    process.exit(1);
}

// Parse the array content (this is a bit hacky but avoids needing a full TS parser)
// We'll use a regex to extract each object block
const objectRegex = /{\s*name:\s*'([^']+)',[\s\S]*?}/g;
const countries = [];
let objMatch;

while ((objMatch = objectRegex.exec(match[1])) !== null) {
    // Construct a valid JSON string from the JS object string
    // This requires adding quotes to keys and handling single quotes
    let objStr = objMatch[0]
        .replace(/(\w+):/g, '"$1":') // Quote keys
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/,(\s*})/g, '$1'); // Remove trailing commas

    try {
        // We need to be careful with the regex replacement, it might break values containing : or '
        // So let's try a safer manual parsing or just use the regex capture groups for key fields

        const nameMatch = objMatch[0].match(/name:\s*'([^']+)'/);
        const mapNameMatch = objMatch[0].match(/mapName:\s*'([^']+)'/);
        const capitalMatch = objMatch[0].match(/capital:\s*'([^']+)'/);
        const continentMatch = objMatch[0].match(/continent:\s*'([^']+)'/);
        const codeMatch = objMatch[0].match(/code:\s*'([^']+)'/);
        const populationMatch = objMatch[0].match(/population:\s*(\d+)/);
        const mainLanguageMatch = objMatch[0].match(/mainLanguage:\s*'([^']+)'/);
        const neighborsMatch = objMatch[0].match(/neighboringCountries:\s*\[(.*?)\]/s);

        if (nameMatch) {
            countries.push({
                name: nameMatch[1],
                mapName: mapNameMatch ? mapNameMatch[1] : undefined,
                capital: capitalMatch ? capitalMatch[1] : '',
                continent: continentMatch ? continentMatch[1] : '',
                code: codeMatch ? codeMatch[1] : '',
                population: populationMatch ? parseInt(populationMatch[1]) : undefined,
                mainLanguage: mainLanguageMatch ? mainLanguageMatch[1] : undefined,
                neighboringCountries: neighborsMatch ? neighborsMatch[1].replace(/'/g, '').split(',').map(s => s.trim()).filter(s => s) : []
            });
        }
    } catch (e) {
        console.error('Error parsing object:', e);
    }
}

// Deduplicate based on name
const uniqueCountries = new Map();
countries.forEach(c => {
    if (!uniqueCountries.has(c.name)) {
        uniqueCountries.set(c.name, c);
    }
});

console.log(`Found ${countries.length} total entries`);
console.log(`Found ${uniqueCountries.size} unique entries`);

// List of 195 UN countries (simplified check)
// In a real scenario, we'd have a master list to check against.
// For now, let's just output the unique list sorted by name.

const sortedCountries = Array.from(uniqueCountries.values()).sort((a, b) => a.name.localeCompare(b.name));

// Generate new file content
let newContent = `export type Continent = 'África' | 'América do Sul' | 'América Central' | 'América do Norte' | 'Ásia' | 'Europa' | 'Oceania' | 'Todos';

export interface Country {
  name: string;
  capital: string;
  continent: Continent;
  code: string; // Adicionado para a bandeira
  population?: number;
  neighboringCountries?: string[];
  mainLanguage?: string;
  mapName?: string; // Nome em inglês para o mapa (GeoJSON)
}

// ISTO É IMPORTANTE TER AQUI:
export const CONFIG = {
  OPTIONS_COUNT: 5,
};

export const COUNTRIES_DB: Country[] = [
`;

sortedCountries.forEach(c => {
    newContent += `  {
    name: '${c.name}',
    mapName: '${c.mapName || c.name}', // Fallback to name if mapName missing
    capital: '${c.capital}',
    continent: '${c.continent}',
    code: '${c.code}',
    population: ${c.population || 0},
    mainLanguage: '${c.mainLanguage || ''}',
    neighboringCountries: [${c.neighboringCountries.map(n => `'${n}'`).join(', ')}],
  },
`;
});

newContent += `];
`;

fs.writeFileSync(countriesPath, newContent);
console.log('Updated countries.ts with deduplicated list');
