export type Continent = 'África' | 'América do Sul' | 'América Central' | 'América do Norte' | 'Ásia' | 'Europa' | 'Oceania' | 'Todos';

export interface Country {
  name: string;
  capital: string;
  continent: Continent;
  code: string; // Adicionado para a bandeira
  population?: number;
  neighboringCountries?: string[];
  mainLanguage?: string;
}

// ISTO É IMPORTANTE TER AQUI:
export const CONFIG = {
  OPTIONS_COUNT: 5,
};

export const COUNTRIES_DB: Country[] = [
  {
    name: 'Afeganistão',
    capital: 'Cabul',
    continent: 'Ásia',
    code: 'af',
    population: 43844111,
    mainLanguage: 'Dari',
    neighboringCountries: ['Paquistão', 'Turcomenistão', 'Uzbequistão', 'Tajiquistão', 'China'],
  },

  {
    name: 'Angola',
    capital: 'Luanda',
    continent: 'África',
    code: 'ao',
    population: 39040039,
    mainLanguage: 'Portuguese',
    neighboringCountries: ['República do Congo', 'Zâmbia', 'Namíbia'],
  },

  {
    name: 'Albânia',
    capital: 'Tirana',
    continent: 'Europa',
    code: 'al',
    population: 2790000,
    mainLanguage: 'Albanian',
    neighboringCountries: ['Montenegro', 'Grécia', 'Macedônia do Norte'],
  },

  {
    name: 'Andorra',
    capital: 'Andorra-a-Velha',
    continent: 'Europa',
    code: 'ad',
    population: 80000,
    mainLanguage: 'Catalan',
    neighboringCountries: ['França', 'Espanha'],
  },

  {
    name: 'Emirados Árabes Unidos',
    capital: 'Abu Dhabi',
    continent: 'Ásia',
    code: 'ae',
    population: 9900000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Omã', 'Arábia Saudita'],
  },

  {
    name: 'Armênia',
    capital: 'Erevã',
    continent: 'Europa',
    code: 'am',
    population: 3000000,
    mainLanguage: 'Armenian',
    neighboringCountries: ['Azerbaijão', 'Geórgia'],
  },

  {
    name: 'Austrália',
    capital: 'Camberra',
    continent: 'Oceania',
    code: 'au',
    population: 26273137,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Áustria',
    capital: 'Viena',
    continent: 'Europa',
    code: 'at',
    population: 9081000,
    mainLanguage: 'Austro-Bavarian German',
    neighboringCountries: ['Chéquia', 'Alemanha', 'Hungria', 'Itália', 'Liechtenstein', 'Eslováquia', 'Eslovênia', 'Suíça'],
  },

  {
    name: 'Azerbaijão',
    capital: 'Baku',
    continent: 'Europa',
    code: 'az',
    population: 10500000,
    mainLanguage: 'Azerbaijani',
    neighboringCountries: ['Armênia', 'Geórgia', 'Rússia'],
  },

  {
    name: 'Burundi',
    capital: 'Gitega',
    continent: 'África',
    code: 'bi',
    population: 13000000,
    mainLanguage: 'French',
    neighboringCountries: ['Ruanda'],
  },

  {
    name: 'Bélgica',
    capital: 'Bruxelas',
    continent: 'Europa',
    code: 'be',
    population: 11163000,
    mainLanguage: 'German',
    neighboringCountries: ['França', 'Alemanha', 'Luxemburgo', 'Países Baixos'],
  },

  {
    name: 'Benin',
    capital: 'Porto-Novo',
    continent: 'África',
    code: 'bj',
    population: 13500000,
    mainLanguage: 'French',
    neighboringCountries: ['Burkina Faso', 'Níger', 'Nigéria', 'Togo'],
  },

  {
    name: 'Burkina Faso',
    capital: 'Ouagadougou',
    continent: 'África',
    code: 'bf',
    population: 22000000,
    mainLanguage: 'French',
    neighboringCountries: ['Benin', 'Gana', 'Mali', 'Níger', 'Togo'],
  },

  {
    name: 'Bangladesh',
    capital: 'Daca',
    continent: 'Ásia',
    code: 'bd',
    population: 175686899,
    mainLanguage: 'Bengali',
    neighboringCountries: ['Mianmar', 'Índia'],
  },

  {
    name: 'Bulgária',
    capital: 'Sófia',
    continent: 'Europa',
    code: 'bg',
    population: 6800000,
    mainLanguage: 'Bulgarian',
    neighboringCountries: ['Grécia', 'Macedônia do Norte', 'Romênia', 'Sérvia'],
  },

  {
    name: 'Bahrein',
    capital: 'Manama',
    continent: 'Ásia',
    code: 'bh',
    population: 1150000,
    mainLanguage: 'Arabic',
    neighboringCountries: [],
  },

  {
    name: 'Bahamas',
    capital: 'Nassau',
    continent: 'América Central',
    code: 'bs',
    population: 400000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Bósnia e Herzegovina',
    capital: 'Sarajevo',
    continent: 'Europa',
    code: 'ba',
    population: 3300000,
    mainLanguage: 'Bosnian',
    neighboringCountries: ['Croácia', 'Montenegro', 'Sérvia'],
  },

  {
    name: 'Bielorrússia',
    capital: 'Minsk',
    continent: 'Europa',
    code: 'by',
    population: 9400000,
    mainLanguage: 'Belarusian',
    neighboringCountries: ['Letônia', 'Lituânia', 'Polônia', 'Rússia', 'Ucrânia'],
  },

  {
    name: 'Belize',
    capital: 'Belmopan',
    continent: 'América Central',
    code: 'bz',
    population: 400000,
    mainLanguage: 'Belizean Creole',
    neighboringCountries: ['Guatemala', 'México'],
  },

  {
    name: 'Brasil',
    capital: 'Brasília',
    continent: 'América do Sul',
    code: 'br',
    population: 212812405,
    mainLanguage: 'Portuguese',
    neighboringCountries: ['Colômbia', 'Guiana', 'Paraguai', 'Peru', 'Suriname', 'Uruguai'],
  },

  {
    name: 'Barbados',
    capital: 'Bridgetown',
    continent: 'América Central',
    code: 'bb',
    population: 280000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Butão',
    capital: 'Timbu',
    continent: 'Ásia',
    code: 'bt',
    population: 780000,
    mainLanguage: 'Dzongkha',
    neighboringCountries: ['China', 'Índia'],
  },

  {
    name: 'Botsuana',
    capital: 'Gaborone',
    continent: 'África',
    code: 'bw',
    population: 2700000,
    mainLanguage: 'English',
    neighboringCountries: ['Namíbia', 'África do Sul', 'Zâmbia', 'Zimbábue'],
  },

  {
    name: 'República Centro-Africana',
    capital: 'Bangui',
    continent: 'África',
    code: 'cf',
    population: 5500000,
    mainLanguage: 'French',
    neighboringCountries: ['Camarões', 'Chade', 'República do Congo', 'Sudão do Sul', 'Sudão'],
  },

  {
    name: 'Canadá',
    capital: 'Ottawa',
    continent: 'América do Norte',
    code: 'ca',
    population: 40126723,
    mainLanguage: 'English',
    neighboringCountries: ['Estados Unidos'],
  },

  {
    name: 'Suíça',
    capital: 'Berna',
    continent: 'Europa',
    code: 'ch',
    population: 8797000,
    mainLanguage: 'French',
    neighboringCountries: ['Áustria', 'França', 'Itália', 'Liechtenstein', 'Alemanha'],
  },

  {
    name: 'Chile',
    capital: 'Santiago',
    continent: 'América do Sul',
    code: 'cl',
    population: 20074832,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Peru'],
  },

  {
    name: 'China',
    capital: 'Pequim',
    continent: 'Ásia',
    code: 'cn',
    population: 1416096094,
    mainLanguage: 'Chinese',
    neighboringCountries: ['Afeganistão', 'Butão', 'Mianmar', 'Índia', 'Cazaquistão', 'Nepal', 'Quirguistão', 'Laos', 'Mongólia', 'Paquistão', 'Rússia', 'Tajiquistão'],
  },

  {
    name: 'Camarões',
    capital: 'Yaoundé',
    continent: 'África',
    code: 'cm',
    population: 29776549,
    mainLanguage: 'English',
    neighboringCountries: ['República Centro-Africana', 'Chade', 'República do Congo', 'Guiné Equatorial', 'Gabão', 'Nigéria'],
  },

  {
    name: 'República do Congo',
    capital: 'Brazzaville',
    continent: 'África',
    code: 'cg',
    population: 6000000,
    mainLanguage: 'French',
    neighboringCountries: ['Angola', 'Camarões', 'República Centro-Africana', 'Gabão'],
  },

  {
    name: 'Colômbia',
    capital: 'Bogotá',
    continent: 'América do Sul',
    code: 'co',
    population: 53425635,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Brasil', 'Equador', 'Panamá', 'Peru'],
  },

  {
    name: 'Comores',
    capital: 'Moroni',
    continent: 'África',
    code: 'km',
    population: 860000,
    mainLanguage: 'Arabic',
    neighboringCountries: [],
  },

  {
    name: 'Costa Rica',
    capital: 'San José',
    continent: 'América Central',
    code: 'cr',
    population: 5210000,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Nicarágua', 'Panamá'],
  },

  {
    name: 'Cuba',
    capital: 'Havana',
    continent: 'América Central',
    code: 'cu',
    population: 11200000,
    mainLanguage: 'Spanish',
    neighboringCountries: [],
  },

  {
    name: 'Chipre',
    capital: 'Nicósia',
    continent: 'Europa',
    code: 'cy',
    population: 1200000,
    mainLanguage: 'Greek',
    neighboringCountries: [],
  },

  {
    name: 'Chéquia',
    capital: 'Praga',
    continent: 'Europa',
    code: 'cz',
    population: 10700000,
    mainLanguage: 'Czech',
    neighboringCountries: ['Áustria', 'Alemanha', 'Polônia', 'Eslováquia'],
  },

  {
    name: 'Alemanha',
    capital: 'Berlim',
    continent: 'Europa',
    code: 'de',
    population: 84075075,
    mainLanguage: 'German',
    neighboringCountries: ['Áustria', 'Bélgica', 'Chéquia', 'Dinamarca', 'França', 'Luxemburgo', 'Países Baixos', 'Polônia', 'Suíça'],
  },

  {
    name: 'Djibouti',
    capital: 'Djibouti',
    continent: 'África',
    code: 'dj',
    population: 1100000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Eritreia', 'Etiópia', 'Somália'],
  },

  {
    name: 'Dominica',
    capital: 'Roseau',
    continent: 'América Central',
    code: 'dm',
    population: 75000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Dinamarca',
    capital: 'Copenhague',
    continent: 'Europa',
    code: 'dk',
    population: 5910000,
    mainLanguage: 'Danish',
    neighboringCountries: ['Alemanha'],
  },

  {
    name: 'República Dominicana',
    capital: 'Santo Domingo',
    continent: 'América Central',
    code: 'do',
    population: 75000,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Haiti'],
  },

  {
    name: 'Argélia',
    capital: 'Argel',
    continent: 'África',
    code: 'dz',
    population: 47435312,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Tunísia', 'Líbia', 'Níger', 'Mali', 'Marrocos'],
  },

  {
    name: 'Equador',
    capital: 'Quito',
    continent: 'América do Sul',
    code: 'ec',
    population: 18391801,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Colômbia', 'Peru'],
  },

  {
    name: 'Egito',
    capital: 'Cairo',
    continent: 'África',
    code: 'eg',
    population: 123103479,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Israel', 'Líbia', 'Sudão'],
  },

  {
    name: 'Eritreia',
    capital: 'Asmara',
    continent: 'África',
    code: 'er',
    population: 3700000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Djibouti', 'Etiópia', 'Sudão'],
  },

  {
    name: 'Espanha',
    capital: 'Madri',
    continent: 'Europa',
    code: 'es',
    population: 47889958,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Andorra', 'França', 'Portugal', 'Marrocos'],
  },

  {
    name: 'Estônia',
    capital: 'Tallinn',
    continent: 'Europa',
    code: 'ee',
    population: 1330000,
    mainLanguage: 'Estonian',
    neighboringCountries: ['Letônia', 'Rússia'],
  },

  {
    name: 'Etiópia',
    capital: 'Adis Abeba',
    continent: 'África',
    code: 'et',
    population: 135472051,
    mainLanguage: 'Amharic',
    neighboringCountries: ['Djibouti', 'Eritreia', 'Quênia', 'Somália', 'Sudão do Sul', 'Sudão'],
  },

  {
    name: 'Finlândia',
    capital: 'Helsinque',
    continent: 'Europa',
    code: 'fi',
    population: 5548000,
    mainLanguage: 'Finnish',
    neighboringCountries: ['Noruega', 'Suécia', 'Rússia'],
  },

  {
    name: 'Fiji',
    capital: 'Suva',
    continent: 'Oceania',
    code: 'fj',
    population: 930000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'França',
    capital: 'Paris',
    continent: 'Europa',
    code: 'fr',
    population: 66650804,
    mainLanguage: 'French',
    neighboringCountries: ['Andorra', 'Bélgica', 'Alemanha', 'Itália', 'Luxemburgo', 'Mônaco', 'Espanha', 'Suíça'],
  },

  {
    name: 'Gabão',
    capital: 'Libreville',
    continent: 'África',
    code: 'ga',
    population: 2300000,
    mainLanguage: 'French',
    neighboringCountries: ['Camarões', 'República do Congo', 'Guiné Equatorial'],
  },

  {
    name: 'Reino Unido',
    capital: 'Londres',
    continent: 'Europa',
    code: 'gb',
    population: 69551332,
    mainLanguage: 'English',
    neighboringCountries: ['Irlanda'],
  },

  {
    name: 'Geórgia',
    capital: 'Tbilisi',
    continent: 'Europa',
    code: 'ge',
    population: 3700000,
    mainLanguage: 'Georgian',
    neighboringCountries: ['Armênia', 'Azerbaijão', 'Rússia'],
  },

  {
    name: 'Gana',
    capital: 'Acra',
    continent: 'África',
    code: 'gh',
    population: 35064272,
    mainLanguage: 'English',
    neighboringCountries: ['Burkina Faso', 'Togo'],
  },

  {
    name: 'Guiné',
    capital: 'Conacri',
    continent: 'África',
    code: 'gn',
    population: 13500000,
    mainLanguage: 'French',
    neighboringCountries: ['Guiné-Bissau', 'Libéria', 'Mali', 'Senegal', 'Serra Leoa'],
  },

  {
    name: 'Gâmbia',
    capital: 'Banjul',
    continent: 'África',
    code: 'gm',
    population: 2500000,
    mainLanguage: 'English',
    neighboringCountries: ['Senegal'],
  },

  {
    name: 'Guiné-Bissau',
    capital: 'Bissau',
    continent: 'África',
    code: 'gw',
    population: 2000000,
    mainLanguage: 'Portuguese',
    neighboringCountries: ['Guiné', 'Senegal'],
  },

  {
    name: 'Guiné Equatorial',
    capital: 'Malabo',
    continent: 'África',
    code: 'jq',
    population: 1300000,
    mainLanguage: 'French',
    neighboringCountries: ['Camarões', 'Gabão'],
  },

  {
    name: 'Grécia',
    capital: 'Atenas',
    continent: 'Europa',
    code: 'gr',
    population: 10718000,
    mainLanguage: 'Greek',
    neighboringCountries: ['Albânia', 'Bulgária', 'Macedônia do Norte'],
  },

  {
    name: 'Guatemala',
    capital: 'Cidade da Guatemala',
    continent: 'América Central',
    code: 'gt',
    population: 18358430,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Belize', 'El Salvador', 'Honduras', 'México'],
  },

  {
    name: 'Guiana',
    capital: 'Georgetown',
    continent: 'América do Sul',
    code: 'gy',
    population: 835986,
    mainLanguage: 'English',
    neighboringCountries: ['Brasil', 'Suriname'],
  },

  {
    name: 'Honduras',
    capital: 'Tegucigalpa',
    continent: 'América Central',
    code: 'hn',
    population: 11005850,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Guatemala', 'El Salvador', 'Nicarágua'],
  },

  {
    name: 'Croácia',
    capital: 'Zagrebe',
    continent: 'Europa',
    code: 'hr',
    population: 4050000,
    mainLanguage: 'Croatian',
    neighboringCountries: ['Bósnia e Herzegovina', 'Hungria', 'Montenegro', 'Sérvia', 'Eslovênia'],
  },

  {
    name: 'Haiti',
    capital: 'Porto Príncipe',
    continent: 'América Central',
    code: 'ht',
    population: 11906095,
    mainLanguage: 'French',
    neighboringCountries: ['República Dominicana'],
  },

  {
    name: 'Hungria',
    capital: 'Budapeste',
    continent: 'Europa',
    code: 'hu',
    population: 9700000,
    mainLanguage: 'Hungarian',
    neighboringCountries: ['Áustria', 'Croácia', 'Romênia', 'Sérvia', 'Eslováquia', 'Eslovênia', 'Ucrânia'],
  },

  {
    name: 'Indonésia',
    capital: 'Jacarta',
    continent: 'Ásia',
    code: 'id',
    population: 285721236,
    mainLanguage: 'Indonesian',
    neighboringCountries: ['Timor-Leste', 'Malásia', 'Papua-Nova Guiné'],
  },

  {
    name: 'Índia',
    capital: 'Nova Delhi',
    continent: 'Ásia',
    code: 'in',
    population: 1463865525,
    mainLanguage: 'English',
    neighboringCountries: ['Bangladesh', 'Butão', 'Mianmar', 'China', 'Nepal', 'Paquistão'],
  },

  {
    name: 'Irlanda',
    capital: 'Dublin',
    continent: 'Europa',
    code: 'ie',
    population: 5060000,
    mainLanguage: 'English',
    neighboringCountries: ['Reino Unido'],
  },

  {
    name: 'Iraque',
    capital: 'Bagdá',
    continent: 'Ásia',
    code: 'iq',
    population: 47020774,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Jordânia', 'Kuwait', 'Arábia Saudita', 'Síria'],
  },

  {
    name: 'Islândia',
    capital: 'Reykjavik',
    continent: 'Europa',
    code: 'is',
    population: 370000,
    mainLanguage: 'Icelandic',
    neighboringCountries: [],
  },

  {
    name: 'Israel',
    capital: 'Jerusalém',
    continent: 'Ásia',
    code: 'il',
    population: 8700000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Egito', 'Jordânia', 'Líbano', 'Síria'],
  },

  {
    name: 'Itália',
    capital: 'Roma',
    continent: 'Europa',
    code: 'it',
    population: 59146260,
    mainLanguage: 'Italian',
    neighboringCountries: ['Áustria', 'França', 'San Marino', 'Eslovênia', 'Suíça'],
  },

  {
    name: 'Jamaica',
    capital: 'Kingston',
    continent: 'América Central',
    code: 'jm',
    population: 2750000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Jordânia',
    capital: 'Amã',
    continent: 'Ásia',
    code: 'jo',
    population: 11200000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Iraque', 'Israel', 'Arábia Saudita', 'Síria'],
  },

  {
    name: 'Japão',
    capital: 'Tóquio',
    continent: 'Ásia',
    code: 'jp',
    population: 122837697,
    mainLanguage: 'Japanese',
    neighboringCountries: [],
  },

  {
    name: 'Cazaquistão',
    capital: 'Astana',
    continent: 'Ásia',
    code: 'kz',
    population: 19828169,
    mainLanguage: 'Kazakh',
    neighboringCountries: ['China', 'Quirguistão', 'Rússia', 'Turcomenistão', 'Uzbequistão'],
  },

  {
    name: 'Quênia',
    capital: 'Nairóbi',
    continent: 'África',
    code: 'ke',
    population: 57532493,
    mainLanguage: 'English',
    neighboringCountries: ['Etiópia', 'Somália', 'Sudão do Sul', 'Uganda'],
  },

  {
    name: 'Quirguistão',
    capital: 'Bishkek',
    continent: 'Ásia',
    code: 'kg',
    population: 6800000,
    mainLanguage: 'Kyrgyz',
    neighboringCountries: ['China', 'Cazaquistão', 'Tajiquistão', 'Uzbequistão'],
  },

  {
    name: 'Camboja',
    capital: 'Phnom Penh',
    continent: 'Ásia',
    code: 'kh',
    population: 17585000,
    mainLanguage: 'Khmer',
    neighboringCountries: ['Laos', 'Tailândia'],
  },

  {
    name: 'Kiribati',
    capital: 'Tarawa do Sul',
    continent: 'Oceania',
    code: 'ki',
    population: 120000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'São Cristóvão e Neves',
    capital: 'Basseterre',
    continent: 'América Central',
    code: 'kn',
    population: 55000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Kuwait',
    capital: 'Cidade do Kuwait',
    continent: 'Ásia',
    code: 'kw',
    population: 4300000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Iraque', 'Arábia Saudita'],
  },

  {
    name: 'Laos',
    capital: 'Vientiane',
    continent: 'Ásia',
    code: 'la',
    population: 7526000,
    mainLanguage: 'Lao',
    neighboringCountries: ['Mianmar', 'Camboja', 'China', 'Tailândia'],
  },

  {
    name: 'Líbano',
    capital: 'Beirute',
    continent: 'Ásia',
    code: 'lb',
    population: 6800000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Israel', 'Síria'],
  },

  {
    name: 'Libéria',
    capital: 'Monróvia',
    continent: 'África',
    code: 'lr',
    population: 5200000,
    mainLanguage: 'English',
    neighboringCountries: ['Guiné', 'Serra Leoa'],
  },

  {
    name: 'Líbia',
    capital: 'Trípoli',
    continent: 'África',
    code: 'ly',
    population: 7000000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Argélia', 'Chade', 'Egito', 'Níger', 'Sudão', 'Tunísia'],
  },

  {
    name: 'Santa Lúcia',
    capital: 'Castries',
    continent: 'América Central',
    code: 'lc',
    population: 185000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Liechtenstein',
    capital: 'Vaduz',
    continent: 'Europa',
    code: 'li',
    population: 40000,
    mainLanguage: 'German',
    neighboringCountries: ['Áustria', 'Suíça'],
  },

  {
    name: 'Sri Lanka',
    capital: 'Sri Jayawardenepura Kotte',
    continent: 'Ásia',
    code: 'lk',
    population: 21980000,
    mainLanguage: 'Sinhala',
    neighboringCountries: ['Índia'],
  },

  {
    name: 'Lesoto',
    capital: 'Maseru',
    continent: 'África',
    code: 'ls',
    population: 2100000,
    mainLanguage: 'English',
    neighboringCountries: ['África do Sul'],
  },

  {
    name: 'Lituânia',
    capital: 'Vilnius',
    continent: 'Europa',
    code: 'lt',
    population: 2800000,
    mainLanguage: 'Lithuanian',
    neighboringCountries: ['Bielorrússia', 'Letônia', 'Polônia', 'Rússia'],
  },

  {
    name: 'Luxemburgo',
    capital: 'Luxemburgo',
    continent: 'Europa',
    code: 'lu',
    population: 640000,
    mainLanguage: 'German',
    neighboringCountries: ['Bélgica', 'França', 'Alemanha'],
  },

  {
    name: 'Letônia',
    capital: 'Riga',
    continent: 'Europa',
    code: 'lv',
    population: 1900000,
    mainLanguage: 'Latvian',
    neighboringCountries: ['Bielorrússia', 'Estônia', 'Lituânia', 'Rússia'],
  },

  {
    name: 'Marrocos',
    capital: 'Rabat',
    continent: 'África',
    code: 'ma',
    population: 38430770,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Argélia', 'Espanha'],
  },

  {
    name: 'Mônaco',
    capital: 'Mônaco',
    continent: 'Europa',
    code: 'mc',
    population: 38000,
    mainLanguage: 'French',
    neighboringCountries: ['França'],
  },

  {
    name: 'Madagascar',
    capital: 'Antananarivo',
    continent: 'África',
    code: 'mg',
    population: 32740678,
    mainLanguage: 'French',
    neighboringCountries: [],
  },

  {
    name: 'Maldivas',
    capital: 'Malé',
    continent: 'Ásia',
    code: 'mv',
    population: 550000,
    mainLanguage: 'Maldivian',
    neighboringCountries: [],
  },

  {
    name: 'México',
    capital: 'Cidade do México',
    continent: 'América do Norte',
    code: 'mx',
    population: 131946900,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Belize', 'Guatemala', 'Estados Unidos'],
  },

  {
    name: 'Ilhas Marshall',
    capital: 'Majuro',
    continent: 'Oceania',
    code: 'mh',
    population: 60000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Macedônia do Norte',
    capital: 'Escópia',
    continent: 'Europa',
    code: 'mk',
    population: 2083000,
    mainLanguage: 'Macedonian',
    neighboringCountries: ['Albânia', 'Bulgária', 'Grécia', 'Sérvia'],
  },

  {
    name: 'Mali',
    capital: 'Bamako',
    continent: 'África',
    code: 'ml',
    population: 23597917,
    mainLanguage: 'French',
    neighboringCountries: ['Argélia', 'Burkina Faso', 'Guiné', 'Níger', 'Senegal'],
  },

  {
    name: 'Malta',
    capital: 'Valeta',
    continent: 'Europa',
    code: 'mt',
    population: 520000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Mianmar',
    capital: 'Naypyidaw',
    continent: 'Ásia',
    code: 'mm',
    population: 54850648,
    mainLanguage: 'Burmese',
    neighboringCountries: ['Bangladesh', 'China', 'Índia', 'Laos', 'Tailândia'],
  },

  {
    name: 'Montenegro',
    capital: 'Podgorica',
    continent: 'Europa',
    code: 'me',
    population: 620000,
    mainLanguage: 'Montenegrin',
    neighboringCountries: ['Albânia', 'Bósnia e Herzegovina', 'Croácia', 'Sérvia'],
  },

  {
    name: 'Mongólia',
    capital: 'Ulaanbaatar',
    continent: 'Ásia',
    code: 'mn',
    population: 3400000,
    mainLanguage: 'Mongolian',
    neighboringCountries: ['China', 'Rússia'],
  },

  {
    name: 'Moçambique',
    capital: 'Maputo',
    continent: 'África',
    code: 'mz',
    population: 35631653,
    mainLanguage: 'Portuguese',
    neighboringCountries: ['Malawi', 'África do Sul', 'Eswatini', 'Zâmbia', 'Zimbábue'],
  },

  {
    name: 'Maurício',
    capital: 'Port Louis',
    continent: 'África',
    code: 'mu',
    population: 1300000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Malawi',
    capital: 'Lilongwe',
    continent: 'África',
    code: 'mw',
    population: 20000000,
    mainLanguage: 'English',
    neighboringCountries: ['Moçambique', 'Zâmbia'],
  },

  {
    name: 'Malásia',
    capital: 'Kuala Lumpur',
    continent: 'Ásia',
    code: 'my',
    population: 35977838,
    mainLanguage: 'English',
    neighboringCountries: ['Indonésia', 'Tailândia'],
  },

  {
    name: 'Namíbia',
    capital: 'Windhoek',
    continent: 'África',
    code: 'na',
    population: 2700000,
    mainLanguage: 'Afrikaans',
    neighboringCountries: ['Angola', 'Botsuana', 'África do Sul', 'Zâmbia'],
  },

  {
    name: 'Níger',
    capital: 'Niamey',
    continent: 'África',
    code: 'ne',
    population: 25865235,
    mainLanguage: 'French',
    neighboringCountries: ['Argélia', 'Benin', 'Burkina Faso', 'Chade', 'Líbia', 'Mali', 'Nigéria'],
  },

  {
    name: 'Nigéria',
    capital: 'Abuja',
    continent: 'África',
    code: 'ng',
    population: 237527782,
    mainLanguage: 'English',
    neighboringCountries: ['Benin', 'Camarões', 'Chade', 'Níger'],
  },

  {
    name: 'Nicarágua',
    capital: 'Manágua',
    continent: 'América Central',
    code: 'ni',
    population: 6700000,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Costa Rica', 'Honduras'],
  },

  {
    name: 'Países Baixos',
    capital: 'Amsterdã',
    continent: 'Europa',
    code: 'nl',
    population: 17923000,
    mainLanguage: 'Dutch',
    neighboringCountries: ['Bélgica', 'Alemanha'],
  },

  {
    name: 'Noruega',
    capital: 'Oslo',
    continent: 'Europa',
    code: 'no',
    population: 5480000,
    mainLanguage: 'Norwegian Nynorsk',
    neighboringCountries: ['Finlândia', 'Suécia', 'Rússia'],
  },

  {
    name: 'Nepal',
    capital: 'Catmandu',
    continent: 'Ásia',
    code: 'np',
    population: 30000000,
    mainLanguage: 'Nepali',
    neighboringCountries: ['China', 'Índia'],
  },

  {
    name: 'Nauru',
    capital: 'Yaren',
    continent: 'Oceania',
    code: 'nr',
    population: 10000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Nova Zelândia',
    capital: 'Wellington',
    continent: 'Oceania',
    code: 'nz',
    population: 5050000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Omã',
    capital: 'Mascate',
    continent: 'Ásia',
    code: 'om',
    population: 4800000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Arábia Saudita', 'Emirados Árabes Unidos', 'Iêmen'],
  },

  {
    name: 'Paquistão',
    capital: 'Islamabad',
    continent: 'Ásia',
    code: 'pk',
    population: 255219554,
    mainLanguage: 'English',
    neighboringCountries: ['Afeganistão', 'China', 'Índia'],
  },

  {
    name: 'Panamá',
    capital: 'Cidade do Panamá',
    continent: 'América Central',
    code: 'pa',
    population: 4028000,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Colômbia', 'Costa Rica'],
  },

  {
    name: 'Peru',
    capital: 'Lima',
    continent: 'América do Sul',
    code: 'pe',
    population: 34576665,
    mainLanguage: 'Aymara',
    neighboringCountries: ['Brasil', 'Chile', 'Colômbia', 'Equador'],
  },

  {
    name: 'Filipinas',
    capital: 'Manila',
    continent: 'Ásia',
    code: 'ph',
    population: 116786962,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Palau',
    capital: 'Ngerulmud',
    continent: 'Oceania',
    code: 'pw',
    population: 18000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Papua-Nova Guiné',
    capital: 'Port Moresby',
    continent: 'Oceania',
    code: 'pg',
    population: 9500000,
    mainLanguage: 'English',
    neighboringCountries: ['Indonésia'],
  },

  {
    name: 'Polônia',
    capital: 'Varsóvia',
    continent: 'Europa',
    code: 'pl',
    population: 38140910,
    mainLanguage: 'Polish',
    neighboringCountries: ['Bielorrússia', 'Chéquia', 'Alemanha', 'Lituânia', 'Rússia', 'Eslováquia', 'Ucrânia'],
  },

  {
    name: 'Portugal',
    capital: 'Lisboa',
    continent: 'Europa',
    code: 'pt',
    population: 10295000,
    mainLanguage: 'Portuguese',
    neighboringCountries: ['Espanha'],
  },

  {
    name: 'Paraguai',
    capital: 'Assunção',
    continent: 'América do Sul',
    code: 'py',
    population: 7553000,
    mainLanguage: 'Guaraní',
    neighboringCountries: ['Brasil'],
  },

  {
    name: 'Catar',
    capital: 'Doha',
    continent: 'Ásia',
    code: 'qa',
    population: 3000000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Arábia Saudita'],
  },

  {
    name: 'Romênia',
    capital: 'Bucareste',
    continent: 'Europa',
    code: 'ro',
    population: 22873111,
    mainLanguage: 'Romanian',
    neighboringCountries: ['Bulgária', 'Hungria', 'Sérvia', 'Ucrânia'],
  },

  {
    name: 'Rússia',
    capital: 'Moscou',
    continent: 'Europa',
    code: 'ru',
    population: 143997393,
    mainLanguage: 'Russian',
    neighboringCountries: ['Azerbaijão', 'Bielorrússia', 'China', 'Estônia', 'Finlândia', 'Geórgia', 'Cazaquistão', 'Letônia', 'Lituânia', 'Mongólia', 'Noruega', 'Polônia', 'Ucrânia'],
  },

  {
    name: 'Ruanda',
    capital: 'Kigali',
    continent: 'África',
    code: 'rw',
    population: 14780000,
    mainLanguage: 'English',
    neighboringCountries: ['Burundi', 'Uganda'],
  },

  {
    name: 'Arábia Saudita',
    capital: 'Riad',
    continent: 'Ásia',
    code: 'sa',
    population: 34566328,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Iraque', 'Jordânia', 'Kuwait', 'Omã', 'Catar', 'Emirados Árabes Unidos', 'Iêmen'],
  },

  {
    name: 'Sudão',
    capital: 'Cartum',
    continent: 'África',
    code: 'sd',
    population: 51662147,
    mainLanguage: 'Arabic',
    neighboringCountries: ['República Centro-Africana', 'Chade', 'Egito', 'Eritreia', 'Etiópia', 'Líbia', 'Sudão do Sul'],
  },

  {
    name: 'Senegal',
    capital: 'Dakar',
    continent: 'África',
    code: 'sn',
    population: 17530000,
    mainLanguage: 'French',
    neighboringCountries: ['Gâmbia', 'Guiné', 'Guiné-Bissau', 'Mali'],
  },

  {
    name: 'Cingapura',
    capital: 'Cingapura',
    continent: 'Ásia',
    code: 'sg',
    population: 6000000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Ilhas Salomão',
    capital: 'Honiara',
    continent: 'Oceania',
    code: 'sb',
    population: 720000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Serra Leoa',
    capital: 'Freetown',
    continent: 'África',
    code: 'sl',
    population: 8500000,
    mainLanguage: 'English',
    neighboringCountries: ['Guiné', 'Libéria'],
  },

  {
    name: 'El Salvador',
    capital: 'San Salvador',
    continent: 'América Central',
    code: 'sv',
    population: 6825000,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Guatemala', 'Honduras'],
  },

  {
    name: 'San Marino',
    capital: 'San Marino',
    continent: 'Europa',
    code: 'sm',
    population: 34000,
    mainLanguage: 'Italian',
    neighboringCountries: ['Itália'],
  },

  {
    name: 'Somália',
    capital: 'Mogadíscio',
    continent: 'África',
    code: 'so',
    population: 17000000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Djibouti', 'Etiópia', 'Quênia'],
  },

  {
    name: 'Sérvia',
    capital: 'Belgrado',
    continent: 'Europa',
    code: 'rs',
    population: 6800000,
    mainLanguage: 'Serbian',
    neighboringCountries: ['Bósnia e Herzegovina', 'Bulgária', 'Croácia', 'Hungria', 'Macedônia do Norte', 'Montenegro', 'Romênia'],
  },

  {
    name: 'Sudão do Sul',
    capital: 'Juba',
    continent: 'África',
    code: 'ss',
    population: 16200000,
    mainLanguage: 'English',
    neighboringCountries: ['República Centro-Africana', 'Etiópia', 'Quênia', 'Sudão', 'Uganda'],
  },

  {
    name: 'Suriname',
    capital: 'Paramaribo',
    continent: 'América do Sul',
    code: 'sr',
    population: 630000,
    mainLanguage: 'Dutch',
    neighboringCountries: ['Brasil', 'Guiana'],
  },

  {
    name: 'Eslováquia',
    capital: 'Bratislava',
    continent: 'Europa',
    code: 'sk',
    population: 5450000,
    mainLanguage: 'Slovak',
    neighboringCountries: ['Áustria', 'Chéquia', 'Hungria', 'Polônia', 'Ucrânia'],
  },

  {
    name: 'Eslovênia',
    capital: 'Liubliana',
    continent: 'Europa',
    code: 'si',
    population: 2078000,
    mainLanguage: 'Slovene',
    neighboringCountries: ['Áustria', 'Croácia', 'Itália', 'Hungria'],
  },

  {
    name: 'Suécia',
    capital: 'Estocolmo',
    continent: 'Europa',
    code: 'se',
    population: 10099000,
    mainLanguage: 'Swedish',
    neighboringCountries: ['Finlândia', 'Noruega'],
  },

  {
    name: 'Eswatini',
    capital: 'Mbabane',
    continent: 'África',
    code: 'sz',
    population: 1200000,
    mainLanguage: 'English',
    neighboringCountries: ['Moçambique', 'África do Sul'],
  },

  {
    name: 'Seychelles',
    capital: 'Victoria',
    continent: 'África',
    code: 'sc',
    population: 100000,
    mainLanguage: 'Seychellois Creole',
    neighboringCountries: [],
  },

  {
    name: 'Síria',
    capital: 'Damasco',
    continent: 'Ásia',
    code: 'sy',
    population: 23864134,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Iraque', 'Israel', 'Jordânia', 'Líbano'],
  },

  {
    name: 'Togo',
    capital: 'Lomé',
    continent: 'África',
    code: 'tg',
    population: 9000000,
    mainLanguage: 'French',
    neighboringCountries: ['Benin', 'Burkina Faso', 'Gana'],
  },

  {
    name: 'Tailândia',
    capital: 'Bangkok',
    continent: 'Ásia',
    code: 'th',
    population: 71619863,
    mainLanguage: 'Thai',
    neighboringCountries: ['Mianmar', 'Camboja', 'Laos', 'Malásia'],
  },

  {
    name: 'Tajiquistão',
    capital: 'Dushanbe',
    continent: 'Ásia',
    code: 'tj',
    population: 10000000,
    mainLanguage: 'Russian',
    neighboringCountries: ['Afeganistão', 'China', 'Quirguistão', 'Uzbequistão'],
  },

  {
    name: 'Turcomenistão',
    capital: 'Ashgabat',
    continent: 'Ásia',
    code: 'tm',
    population: 6300000,
    mainLanguage: 'Russian',
    neighboringCountries: ['Afeganistão', 'Cazaquistão', 'Uzbequistão'],
  },

  {
    name: 'Timor-Leste',
    capital: 'Díli',
    continent: 'Ásia',
    code: 'tl',
    population: 1400000,
    mainLanguage: 'Portuguese',
    neighboringCountries: ['Indonésia'],
  },

  {
    name: 'Trinidad e Tobago',
    capital: 'Port of Spain',
    continent: 'América Central',
    code: 'tt',
    population: 1400000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Tunísia',
    capital: 'Túnis',
    continent: 'África',
    code: 'tn',
    population: 12357000,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Argélia', 'Líbia'],
  },

  {
    name: 'Tuvalu',
    capital: 'Funafuti',
    continent: 'Oceania',
    code: 'tv',
    population: 12000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Uganda',
    capital: 'Campala',
    continent: 'África',
    code: 'ug',
    population: 51384900,
    mainLanguage: 'English',
    neighboringCountries: ['Quênia', 'Ruanda', 'Sudão do Sul'],
  },

  {
    name: 'Ucrânia',
    capital: 'Kiev',
    continent: 'Europa',
    code: 'ua',
    population: 51384894,
    mainLanguage: 'Ukrainian',
    neighboringCountries: ['Bielorrússia', 'Hungria', 'Polônia', 'Romênia', 'Rússia', 'Eslováquia'],
  },

  {
    name: 'Uruguai',
    capital: 'Montevidéu',
    continent: 'América do Sul',
    code: 'uy',
    population: 3550000,
    mainLanguage: 'Spanish',
    neighboringCountries: ['Brasil'],
  },

  {
    name: 'Estados Unidos',
    capital: 'Washington, D.C.',
    continent: 'América do Norte',
    code: 'us',
    population: 347275807,
    mainLanguage: 'English',
    neighboringCountries: ['Canadá', 'México'],
  },

  {
    name: 'Uzbequistão',
    capital: 'Tashkent',
    continent: 'Ásia',
    code: 'uz',
    population: 37053428,
    mainLanguage: 'Russian',
    neighboringCountries: ['Afeganistão', 'Cazaquistão', 'Quirguistão', 'Tajiquistão', 'Turcomenistão'],
  },

  {
    name: 'São Vicente e Granadinas',
    capital: 'Kingstown',
    continent: 'América Central',
    code: 'vc',
    population: 110000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Samoa',
    capital: 'Apia',
    continent: 'Oceania',
    code: 'ws',
    population: 200000,
    mainLanguage: 'English',
    neighboringCountries: [],
  },

  {
    name: 'Iêmen',
    capital: 'Sana',
    continent: 'Ásia',
    code: 'ye',
    population: 41773878,
    mainLanguage: 'Arabic',
    neighboringCountries: ['Omã', 'Arábia Saudita'],
  },

  {
    name: 'África do Sul',
    capital: 'Pretória',
    continent: 'África',
    code: 'za',
    population: 64747319,
    mainLanguage: 'Afrikaans',
    neighboringCountries: ['Botsuana', 'Lesoto', 'Moçambique', 'Namíbia', 'Eswatini', 'Zimbábue'],
  },

  {
    name: 'Zâmbia',
    capital: 'Lusaka',
    continent: 'África',
    code: 'zm',
    population: 17861030,
    mainLanguage: 'English',
    neighboringCountries: ['Angola', 'Botsuana', 'Malawi', 'Moçambique', 'Namíbia', 'Zimbábue'],
  },

  {
    name: 'Zimbábue',
    capital: 'Harare',
    continent: 'África',
    code: 'zw',
    population: 17400000,
    mainLanguage: 'Chibarwe',
    neighboringCountries: ['Botsuana', 'Moçambique', 'África do Sul', 'Zâmbia'],
  },
];