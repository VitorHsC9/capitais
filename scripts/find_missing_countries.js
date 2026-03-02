import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const countriesPath = path.join(__dirname, 'src/data/countries.ts');
const content = fs.readFileSync(countriesPath, 'utf8');

// Extract current names
const regex = /name: '([^']+)'/g;
const currentNames = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
    currentNames.add(match[1]);
}

console.log(`Current count: ${currentNames.size}`);

// Full list of 195 UN recognized countries (in Portuguese)
const allCountries = [
    'Afeganistão', 'África do Sul', 'Albânia', 'Alemanha', 'Andorra', 'Angola', 'Antígua e Barbuda', 'Arábia Saudita', 'Argélia', 'Argentina', 'Armênia', 'Austrália', 'Áustria', 'Azerbaijão',
    'Bahamas', 'Bahrein', 'Bangladesh', 'Barbados', 'Bélgica', 'Belize', 'Benin', 'Bielorrússia', 'Bolívia', 'Bósnia e Herzegovina', 'Botsuana', 'Brasil', 'Brunei', 'Bulgária', 'Burkina Faso', 'Burundi', 'Butão',
    'Cabo Verde', 'Camarões', 'Camboja', 'Canadá', 'Catar', 'Cazaquistão', 'Chade', 'Chile', 'China', 'Chipre', 'Colômbia', 'Comores', 'Congo', 'Coreia do Norte', 'Coreia do Sul', 'Costa do Marfim', 'Costa Rica', 'Croácia', 'Cuba',
    'Dinamarca', 'Djibouti', 'Dominica',
    'Egito', 'El Salvador', 'Emirados Árabes Unidos', 'Equador', 'Eritreia', 'Eslováquia', 'Eslovênia', 'Espanha', 'Estados Unidos', 'Estônia', 'Essuatíni', 'Etiópia',
    'Fiji', 'Filipinas', 'Finlândia', 'França',
    'Gabão', 'Gâmbia', 'Gana', 'Geórgia', 'Granada', 'Grécia', 'Guatemala', 'Guiana', 'Guiné', 'Guiné-Bissau', 'Guiné Equatorial',
    'Haiti', 'Honduras', 'Hungria',
    'Iêmen', 'Ilhas Marshall', 'Ilhas Salomão', 'Índia', 'Indonésia', 'Irã', 'Iraque', 'Irlanda', 'Islândia', 'Israel', 'Itália',
    'Jamaica', 'Japão', 'Jordânia',
    'Kiribati', 'Kuwait',
    'Laos', 'Lesoto', 'Letônia', 'Líbano', 'Libéria', 'Líbia', 'Liechtenstein', 'Lituânia', 'Luxemburgo',
    'Macedônia do Norte', 'Madagascar', 'Malásia', 'Malawi', 'Maldivas', 'Mali', 'Malta', 'Marrocos', 'Maurício', 'Mauritânia', 'México', 'Mianmar', 'Micronésia', 'Moçambique', 'Moldávia', 'Mônaco', 'Mongólia', 'Montenegro',
    'Namíbia', 'Nauru', 'Nepal', 'Nicarágua', 'Níger', 'Nigéria', 'Noruega', 'Nova Zelândia',
    'Omã',
    'Países Baixos', 'Palau', 'Panamá', 'Papua-Nova Guiné', 'Paquistão', 'Paraguai', 'Peru', 'Polônia', 'Portugal',
    'Quênia', 'Quirguistão',
    'Reino Unido', 'República Centro-Africana', 'República Checa', 'República Democrática do Congo', 'República Dominicana', 'Romênia', 'Ruanda', 'Rússia',
    'Samoa', 'Santa Lúcia', 'São Cristóvão e Neves', 'San Marino', 'São Tomé e Príncipe', 'São Vicente e Granadinas', 'Senegal', 'Serra Leoa', 'Sérvia', 'Seychelles', 'Singapura', 'Síria', 'Somália', 'Sri Lanka', 'Sudão', 'Sudão do Sul', 'Suécia', 'Suíça', 'Suriname',
    'Tailândia', 'Tajiquistão', 'Tanzânia', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad e Tobago', 'Tunísia', 'Turcomenistão', 'Turquia', 'Tuvalu',
    'Ucrânia', 'Uganda', 'Uruguai', 'Uzbequistão',
    'Vanuatu', 'Vaticano', 'Venezuela', 'Vietnã',
    'Zâmbia', 'Zimbábue'
];

// Note: 'República Checa' might be 'Chéquia' in current list.
// 'Congo' might be 'República do Congo'.
// 'Vaticano' might be 'Santa Sé'.

const missing = [];
allCountries.forEach(c => {
    if (!currentNames.has(c)) {
        // Check for common aliases
        if (c === 'República Checa' && currentNames.has('Chéquia')) return;
        if (c === 'Congo' && currentNames.has('República do Congo')) return;
        if (c === 'Vaticano' && currentNames.has('Santa Sé')) return;
        if (c === 'Essuatíni' && currentNames.has('Suazilândia')) return;
        if (c === 'Macedônia do Norte' && currentNames.has('Macedônia')) return;

        missing.push(c);
    }
});

console.log('Missing countries:', missing);
console.log('Total missing:', missing.length);
