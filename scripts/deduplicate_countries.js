import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current file
const countriesPath = path.join(__dirname, 'src/data/countries.ts');
const content = fs.readFileSync(countriesPath, 'utf8');

// Extract the array content
const match = /export const COUNTRIES_DB: Country\[\] = \[([\s\S]*)\];/.exec(content);
if (!match) {
    console.error('Could not find COUNTRIES_DB array');
    process.exit(1);
}

// Parse the array content (this is a bit hacky but avoids needing a full TS parser)
// We'll use a regex to extract each object block
const objectRegex = /{\s*name:\s*'([^']+)',[\s\S]*?}/g;
const countries = [];
let objMatch;

const getCapture = (text, regex) => regex.exec(text)?.[1];

while ((objMatch = objectRegex.exec(match[1])) !== null) {
    try {
        // We need to be careful with the regex replacement, it might break values containing : or '
        // So let's try a safer manual parsing or just use the regex capture groups for key fields

        const objectText = objMatch[0];
        const name = getCapture(objectText, /name:\s*'([^']+)'/);
        const mapName = getCapture(objectText, /mapName:\s*'([^']+)'/);
        const capital = getCapture(objectText, /capital:\s*'([^']+)'/);
        const continent = getCapture(objectText, /continent:\s*'([^']+)'/);
        const code = getCapture(objectText, /code:\s*'([^']+)'/);
        const population = getCapture(objectText, /population:\s*(\d+)/);
        const mainLanguage = getCapture(objectText, /mainLanguage:\s*'([^']+)'/);
        const neighbors = getCapture(objectText, /neighboringCountries:\s*\[(.*?)\]/s);

        if (name) {
            countries.push({
                name,
                mapName,
                capital: capital || '',
                continent: continent || '',
                code: code || '',
                population: population ? Number.parseInt(population, 10) : undefined,
                mainLanguage,
                neighboringCountries: neighbors ? neighbors.replaceAll("'", '').split(',').map(s => s.trim()).filter(Boolean) : []
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
