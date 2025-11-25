import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  Check, 
  X,
  MapPin,
  Home,
  Moon,
  Sun
} from 'lucide-react';

// ==========================================
// 1. DADOS & CONFIGURAÇÕES
// ==========================================

type Continent = 'África' | 'América do Sul' | 'América Central' | 'América do Norte' | 'Ásia' | 'Europa' | 'Oceania' | 'Todos';

interface Country {
  name: string;
  capital: string;
  continent: Continent;
}

const CONFIG = {
  OPTIONS_COUNT: 5,
};

// Banco de dados completo (ONU + Observadores)
const COUNTRIES_DB: Country[] = [
  // --- AMÉRICA DO SUL ---
  { name: 'Argentina', capital: 'Buenos Aires', continent: 'América do Sul' },
  { name: 'Bolívia', capital: 'Sucre', continent: 'América do Sul' },
  { name: 'Brasil', capital: 'Brasília', continent: 'América do Sul' },
  { name: 'Chile', capital: 'Santiago', continent: 'América do Sul' },
  { name: 'Colômbia', capital: 'Bogotá', continent: 'América do Sul' },
  { name: 'Equador', capital: 'Quito', continent: 'América do Sul' },
  { name: 'Guiana', capital: 'Georgetown', continent: 'América do Sul' },
  { name: 'Paraguai', capital: 'Assunção', continent: 'América do Sul' },
  { name: 'Peru', capital: 'Lima', continent: 'América do Sul' },
  { name: 'Suriname', capital: 'Paramaribo', continent: 'América do Sul' },
  { name: 'Uruguai', capital: 'Montevidéu', continent: 'América do Sul' },
  { name: 'Venezuela', capital: 'Caracas', continent: 'América do Sul' },

  // --- AMÉRICA DO NORTE ---
  { name: 'Canadá', capital: 'Ottawa', continent: 'América do Norte' },
  { name: 'Estados Unidos', capital: 'Washington, D.C.', continent: 'América do Norte' },
  { name: 'México', capital: 'Cidade do México', continent: 'América do Norte' },

  // --- AMÉRICA CENTRAL & CARIBE ---
  { name: 'Antígua e Barbuda', capital: "Saint John's", continent: 'América Central' },
  { name: 'Bahamas', capital: 'Nassau', continent: 'América Central' },
  { name: 'Barbados', capital: 'Bridgetown', continent: 'América Central' },
  { name: 'Belize', capital: 'Belmopan', continent: 'América Central' },
  { name: 'Costa Rica', capital: 'San José', continent: 'América Central' },
  { name: 'Cuba', capital: 'Havana', continent: 'América Central' },
  { name: 'Dominica', capital: 'Roseau', continent: 'América Central' },
  { name: 'El Salvador', capital: 'San Salvador', continent: 'América Central' },
  { name: 'Granada', capital: "Saint George's", continent: 'América Central' },
  { name: 'Guatemala', capital: 'Cidade da Guatemala', continent: 'América Central' },
  { name: 'Haiti', capital: 'Porto Príncipe', continent: 'América Central' },
  { name: 'Honduras', capital: 'Tegucigalpa', continent: 'América Central' },
  { name: 'Jamaica', capital: 'Kingston', continent: 'América Central' },
  { name: 'Nicarágua', capital: 'Manágua', continent: 'América Central' },
  { name: 'Panamá', capital: 'Cidade do Panamá', continent: 'América Central' },
  { name: 'República Dominicana', capital: 'Santo Domingo', continent: 'América Central' },
  { name: 'Santa Lúcia', capital: 'Castries', continent: 'América Central' },
  { name: 'São Cristóvão e Neves', capital: 'Basseterre', continent: 'América Central' },
  { name: 'São Vicente e Granadinas', capital: 'Kingstown', continent: 'América Central' },
  { name: 'Trinidad e Tobago', capital: 'Port of Spain', continent: 'América Central' },

  // --- EUROPA ---
  { name: 'Albânia', capital: 'Tirana', continent: 'Europa' },
  { name: 'Alemanha', capital: 'Berlim', continent: 'Europa' },
  { name: 'Andorra', capital: 'Andorra-a-Velha', continent: 'Europa' },
  { name: 'Armênia', capital: 'Erevã', continent: 'Europa' },
  { name: 'Áustria', capital: 'Viena', continent: 'Europa' },
  { name: 'Azerbaijão', capital: 'Baku', continent: 'Europa' },
  { name: 'Bélgica', capital: 'Bruxelas', continent: 'Europa' },
  { name: 'Bielorrússia', capital: 'Minsk', continent: 'Europa' },
  { name: 'Bósnia e Herzegovina', capital: 'Sarajevo', continent: 'Europa' },
  { name: 'Bulgária', capital: 'Sófia', continent: 'Europa' },
  { name: 'Chéquia', capital: 'Praga', continent: 'Europa' },
  { name: 'Chipre', capital: 'Nicósia', continent: 'Europa' },
  { name: 'Croácia', capital: 'Zagrebe', continent: 'Europa' },
  { name: 'Dinamarca', capital: 'Copenhague', continent: 'Europa' },
  { name: 'Eslováquia', capital: 'Bratislava', continent: 'Europa' },
  { name: 'Eslovênia', capital: 'Liubliana', continent: 'Europa' },
  { name: 'Espanha', capital: 'Madri', continent: 'Europa' },
  { name: 'Estônia', capital: 'Tallinn', continent: 'Europa' },
  { name: 'Finlândia', capital: 'Helsinque', continent: 'Europa' },
  { name: 'França', capital: 'Paris', continent: 'Europa' },
  { name: 'Geórgia', capital: 'Tbilisi', continent: 'Europa' },
  { name: 'Grécia', capital: 'Atenas', continent: 'Europa' },
  { name: 'Hungria', capital: 'Budapeste', continent: 'Europa' },
  { name: 'Irlanda', capital: 'Dublin', continent: 'Europa' },
  { name: 'Islândia', capital: 'Reykjavik', continent: 'Europa' },
  { name: 'Itália', capital: 'Roma', continent: 'Europa' },
  { name: 'Letônia', capital: 'Riga', continent: 'Europa' },
  { name: 'Liechtenstein', capital: 'Vaduz', continent: 'Europa' },
  { name: 'Lituânia', capital: 'Vilnius', continent: 'Europa' },
  { name: 'Luxemburgo', capital: 'Luxemburgo', continent: 'Europa' },
  { name: 'Macedônia do Norte', capital: 'Escópia', continent: 'Europa' },
  { name: 'Malta', capital: 'Valeta', continent: 'Europa' },
  { name: 'Moldávia', capital: 'Chisinau', continent: 'Europa' },
  { name: 'Mônaco', capital: 'Mônaco', continent: 'Europa' },
  { name: 'Montenegro', capital: 'Podgorica', continent: 'Europa' },
  { name: 'Noruega', capital: 'Oslo', continent: 'Europa' },
  { name: 'Países Baixos', capital: 'Amsterdã', continent: 'Europa' },
  { name: 'Polônia', capital: 'Varsóvia', continent: 'Europa' },
  { name: 'Portugal', capital: 'Lisboa', continent: 'Europa' },
  { name: 'Reino Unido', capital: 'Londres', continent: 'Europa' },
  { name: 'Romênia', capital: 'Bucareste', continent: 'Europa' },
  { name: 'Rússia', capital: 'Moscou', continent: 'Europa' },
  { name: 'San Marino', capital: 'San Marino', continent: 'Europa' },
  { name: 'Sérvia', capital: 'Belgrado', continent: 'Europa' },
  { name: 'Suécia', capital: 'Estocolmo', continent: 'Europa' },
  { name: 'Suíça', capital: 'Berna', continent: 'Europa' },
  { name: 'Ucrânia', capital: 'Kiev', continent: 'Europa' },
  { name: 'Vaticano', capital: 'Cidade do Vaticano', continent: 'Europa' },
  { name: 'Turquia', capital: 'Ancara', continent: 'Europa' },

  // --- ÁSIA ---
  { name: 'Afeganistão', capital: 'Cabul', continent: 'Ásia' },
  { name: 'Arábia Saudita', capital: 'Riad', continent: 'Ásia' },
  { name: 'Bahrein', capital: 'Manama', continent: 'Ásia' },
  { name: 'Bangladesh', capital: 'Daca', continent: 'Ásia' },
  { name: 'Brunei', capital: 'Bandar Seri Begawan', continent: 'Ásia' },
  { name: 'Butão', capital: 'Timbu', continent: 'Ásia' },
  { name: 'Camboja', capital: 'Phnom Penh', continent: 'Ásia' },
  { name: 'Cazaquistão', capital: 'Astana', continent: 'Ásia' },
  { name: 'China', capital: 'Pequim', continent: 'Ásia' },
  { name: 'Cingapura', capital: 'Cingapura', continent: 'Ásia' },
  { name: 'Coreia do Norte', capital: 'Pyongyang', continent: 'Ásia' },
  { name: 'Coreia do Sul', capital: 'Seul', continent: 'Ásia' },
  { name: 'Emirados Árabes Unidos', capital: 'Abu Dhabi', continent: 'Ásia' },
  { name: 'Filipinas', capital: 'Manila', continent: 'Ásia' },
  { name: 'Iêmen', capital: 'Sana', continent: 'Ásia' },
  { name: 'Índia', capital: 'Nova Delhi', continent: 'Ásia' },
  { name: 'Indonésia', capital: 'Jacarta', continent: 'Ásia' },
  { name: 'Irã', capital: 'Teerã', continent: 'Ásia' },
  { name: 'Iraque', capital: 'Bagdá', continent: 'Ásia' },
  { name: 'Israel', capital: 'Jerusalém', continent: 'Ásia' },
  { name: 'Japão', capital: 'Tóquio', continent: 'Ásia' },
  { name: 'Jordânia', capital: 'Amã', continent: 'Ásia' },
  { name: 'Kuwait', capital: 'Cidade do Kuwait', continent: 'Ásia' },
  { name: 'Laos', capital: 'Vientiane', continent: 'Ásia' },
  { name: 'Líbano', capital: 'Beirute', continent: 'Ásia' },
  { name: 'Malásia', capital: 'Kuala Lumpur', continent: 'Ásia' },
  { name: 'Maldivas', capital: 'Malé', continent: 'Ásia' },
  { name: 'Mianmar', capital: 'Naypyidaw', continent: 'Ásia' },
  { name: 'Mongólia', capital: 'Ulaanbaatar', continent: 'Ásia' },
  { name: 'Nepal', capital: 'Catmandu', continent: 'Ásia' },
  { name: 'Omã', capital: 'Mascate', continent: 'Ásia' },
  { name: 'Palestina', capital: 'Ramallah', continent: 'Ásia' },
  { name: 'Paquistão', capital: 'Islamabad', continent: 'Ásia' },
  { name: 'Catar', capital: 'Doha', continent: 'Ásia' },
  { name: 'Quirguistão', capital: 'Bishkek', continent: 'Ásia' },
  { name: 'Síria', capital: 'Damasco', continent: 'Ásia' },
  { name: 'Sri Lanka', capital: 'Sri Jayawardenepura Kotte', continent: 'Ásia' },
  { name: 'Tailândia', capital: 'Bangkok', continent: 'Ásia' },
  { name: 'Tajiquistão', capital: 'Dushanbe', continent: 'Ásia' },
  { name: 'Timor-Leste', capital: 'Díli', continent: 'Ásia' },
  { name: 'Turcomenistão', capital: 'Ashgabat', continent: 'Ásia' },
  { name: 'Uzbequistão', capital: 'Tashkent', continent: 'Ásia' },
  { name: 'Vietnã', capital: 'Hanói', continent: 'Ásia' },

  // --- ÁFRICA ---
  { name: 'África do Sul', capital: 'Pretória', continent: 'África' },
  { name: 'Angola', capital: 'Luanda', continent: 'África' },
  { name: 'Argélia', capital: 'Argel', continent: 'África' },
  { name: 'Benin', capital: 'Porto-Novo', continent: 'África' },
  { name: 'Botsuana', capital: 'Gaborone', continent: 'África' },
  { name: 'Burkina Faso', capital: 'Ouagadougou', continent: 'África' },
  { name: 'Burundi', capital: 'Gitega', continent: 'África' },
  { name: 'Cabo Verde', capital: 'Praia', continent: 'África' },
  { name: 'Camarões', capital: 'Yaoundé', continent: 'África' },
  { name: 'Chade', capital: "N'Djamena", continent: 'África' },
  { name: 'Comores', capital: 'Moroni', continent: 'África' },
  { name: 'Costa do Marfim', capital: 'Yamoussoukro', continent: 'África' },
  { name: 'Djibouti', capital: 'Djibouti', continent: 'África' },
  { name: 'Egito', capital: 'Cairo', continent: 'África' },
  { name: 'Eritreia', capital: 'Asmara', continent: 'África' },
  { name: 'Eswatini', capital: 'Mbabane', continent: 'África' },
  { name: 'Etiópia', capital: 'Adis Abeba', continent: 'África' },
  { name: 'Gabão', capital: 'Libreville', continent: 'África' },
  { name: 'Gâmbia', capital: 'Banjul', continent: 'África' },
  { name: 'Gana', capital: 'Acra', continent: 'África' },
  { name: 'Guiné', capital: 'Conacri', continent: 'África' },
  { name: 'Guiné-Bissau', capital: 'Bissau', continent: 'África' },
  { name: 'Guiné Equatorial', capital: 'Malabo', continent: 'África' },
  { name: 'Lesoto', capital: 'Maseru', continent: 'África' },
  { name: 'Libéria', capital: 'Monróvia', continent: 'África' },
  { name: 'Líbia', capital: 'Trípoli', continent: 'África' },
  { name: 'Madagascar', capital: 'Antananarivo', continent: 'África' },
  { name: 'Malawi', capital: 'Lilongwe', continent: 'África' },
  { name: 'Mali', capital: 'Bamako', continent: 'África' },
  { name: 'Marrocos', capital: 'Rabat', continent: 'África' },
  { name: 'Maurício', capital: 'Port Louis', continent: 'África' },
  { name: 'Mauritânia', capital: 'Nouakchott', continent: 'África' },
  { name: 'Moçambique', capital: 'Maputo', continent: 'África' },
  { name: 'Namíbia', capital: 'Windhoek', continent: 'África' },
  { name: 'Níger', capital: 'Niamey', continent: 'África' },
  { name: 'Nigéria', capital: 'Abuja', continent: 'África' },
  { name: 'Quênia', capital: 'Nairóbi', continent: 'África' },
  { name: 'República Centro-Africana', capital: 'Bangui', continent: 'África' },
  { name: 'República Democrática do Congo', capital: 'Kinshasa', continent: 'África' },
  { name: 'República do Congo', capital: 'Brazzaville', continent: 'África' },
  { name: 'Ruanda', capital: 'Kigali', continent: 'África' },
  { name: 'São Tomé e Príncipe', capital: 'São Tomé', continent: 'África' },
  { name: 'Senegal', capital: 'Dakar', continent: 'África' },
  { name: 'Serra Leoa', capital: 'Freetown', continent: 'África' },
  { name: 'Seychelles', capital: 'Victoria', continent: 'África' },
  { name: 'Somália', capital: 'Mogadíscio', continent: 'África' },
  { name: 'Sudão', capital: 'Cartum', continent: 'África' },
  { name: 'Sudão do Sul', capital: 'Juba', continent: 'África' },
  { name: 'Tanzânia', capital: 'Dodoma', continent: 'África' },
  { name: 'Togo', capital: 'Lomé', continent: 'África' },
  { name: 'Tunísia', capital: 'Túnis', continent: 'África' },
  { name: 'Uganda', capital: 'Campala', continent: 'África' },
  { name: 'Zâmbia', capital: 'Lusaka', continent: 'África' },
  { name: 'Zimbábue', capital: 'Harare', continent: 'África' },

  // --- OCEANIA ---
  { name: 'Austrália', capital: 'Camberra', continent: 'Oceania' },
  { name: 'Fiji', capital: 'Suva', continent: 'Oceania' },
  { name: 'Ilhas Marshall', capital: 'Majuro', continent: 'Oceania' },
  { name: 'Ilhas Salomão', capital: 'Honiara', continent: 'Oceania' },
  { name: 'Kiribati', capital: 'Tarawa do Sul', continent: 'Oceania' },
  { name: 'Micronésia', capital: 'Palikir', continent: 'Oceania' },
  { name: 'Nauru', capital: 'Yaren', continent: 'Oceania' },
  { name: 'Nova Zelândia', capital: 'Wellington', continent: 'Oceania' },
  { name: 'Palau', capital: 'Ngerulmud', continent: 'Oceania' },
  { name: 'Papua-Nova Guiné', capital: 'Port Moresby', continent: 'Oceania' },
  { name: 'Samoa', capital: 'Apia', continent: 'Oceania' },
  { name: 'Tonga', capital: "Nuku'alofa", continent: 'Oceania' },
  { name: 'Tuvalu', capital: 'Funafuti', continent: 'Oceania' },
  { name: 'Vanuatu', capital: 'Port Vila', continent: 'Oceania' }
];

// ==========================================
// 2. UTILITÁRIOS & ESTILOS
// ==========================================

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// ==========================================
// 3. SUB-COMPONENTES (Para organização visual)
// ==========================================

const Header = ({ isDark, toggleTheme, onExit, isPlaying }: { isDark: boolean, toggleTheme: () => void, onExit: () => void, isPlaying: boolean }) => (
  <header className="px-6 py-6 flex justify-between items-center relative z-10">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-slate-700 text-white' : 'bg-indigo-600 text-white'}`}>
        <MapPin className="w-4 h-4" />
      </div>
      <h1 className="text-lg font-bold tracking-tight">Quiz Capitais</h1>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      {isPlaying && (
        <button onClick={onExit} className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  </header>
);

const ProgressBar = ({ current, total, isDark }: { current: number, total: number, isDark: boolean }) => (
  <div className={`flex items-center gap-4 text-sm font-medium mb-8 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
    <span className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-900'}`}>{String(current + 1).padStart(2, '0')}</span>
    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
      <div 
        className={`h-full transition-all duration-500 ease-out rounded-full ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`} 
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{String(total).padStart(2, '0')}</span>
  </div>
);

const OptionButton = ({ 
  option, 
  idx, 
  isSelected, 
  isCorrect, 
  isAnswered, 
  onSelect, 
  isDark 
}: { 
  option: Country, 
  idx: number, 
  isSelected: boolean, 
  isCorrect: boolean, 
  isAnswered: boolean, 
  onSelect: () => void, 
  isDark: boolean 
}) => {
  // ESTILOS BASE
  let containerClass = `group w-full p-4 border rounded-xl transition-all duration-200 flex items-center justify-between gap-4 `;
  let textClass = "font-medium text-base truncate flex-grow text-center";
  let badgeClass = `flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors `;
  let icon = null;

  // ESTILOS DO TEMA
  const styles = {
    base: isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200',
    badge: isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500',
    badgeActive: isDark ? 'group-hover:bg-slate-200 group-hover:text-slate-900' : 'group-hover:bg-indigo-100 group-hover:text-indigo-600',
    success: isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200',
    error: isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200',
    textSuccess: isDark ? 'text-green-400 font-bold' : 'text-green-800 font-bold',
    textError: isDark ? 'text-red-400' : 'text-red-800',
    badgeSuccess: isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-200 text-green-800',
    badgeError: isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-200 text-red-800',
    iconSuccess: isDark ? 'text-green-400' : 'text-green-600',
    iconError: isDark ? 'text-red-400' : 'text-red-600',
    disabled: isDark ? 'opacity-40 bg-slate-800 border-slate-700' : 'opacity-50 bg-slate-50 border-slate-100'
  };

  if (isAnswered) {
    if (isCorrect) {
      containerClass += styles.success + ' shadow-sm';
      textClass += ` ${styles.textSuccess}`;
      badgeClass += styles.badgeSuccess;
      icon = <Check className={`w-6 h-6 ${styles.iconSuccess}`} />;
    } else if (isSelected) {
      containerClass += styles.error + ' shadow-sm';
      textClass += ` ${styles.textError}`;
      badgeClass += styles.badgeError;
      icon = <X className={`w-6 h-6 ${styles.iconError}`} />;
    } else {
      containerClass += styles.disabled;
      badgeClass += styles.badge;
    }
  } else {
    containerClass += styles.base + (isDark ? ' hover:border-slate-500' : ' hover:border-indigo-300 hover:shadow-md');
    badgeClass += styles.badge + ' ' + styles.badgeActive;
  }

  return (
    <button
      disabled={isAnswered}
      onClick={onSelect}
      className={containerClass}
    >
      <div className="flex-shrink-0 w-8 flex justify-start">
        <span className={badgeClass}>
          {String.fromCharCode(65 + idx)}
        </span>
      </div>
      
      <span className={textClass}>
        {option.capital}
      </span>

      <div className="flex-shrink-0 w-8 flex justify-end">
         {icon ? icon : <div className="w-6 h-6" />} 
      </div>
    </button>
  );
};

// ==========================================
// 4. APP PRINCIPAL
// ==========================================

export default function App() {
  // Estado Global
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [selectedContinent, setSelectedContinent] = useState<Continent>('Todos');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Estado do Jogo
  const [questions, setQuestions] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // Estado da Pergunta
  const [currentOptions, setCurrentOptions] = useState<Country[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // --- Lógica do Quiz ---

  const startQuiz = (continent: Continent) => {
    setSelectedContinent(continent);
    let pool = continent === 'Todos' 
      ? COUNTRIES_DB 
      : COUNTRIES_DB.filter(c => c.continent === continent);
    
    if (pool.length === 0) return alert("Erro ao carregar países.");

    setQuestions(shuffleArray(pool));
    setCurrentIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing' || !questions[currentIndex]) return;
    
    const correct = questions[currentIndex];
    const pool = COUNTRIES_DB.filter(c => c.name !== correct.name);
    const sameContinent = pool.filter(c => c.continent === correct.continent);
    const others = pool.filter(c => c.continent !== correct.continent);
    
    let distractors = shuffleArray(sameContinent);
    const needed = CONFIG.OPTIONS_COUNT - 1;
    
    if (distractors.length < needed) {
      distractors = [...distractors, ...shuffleArray(others).slice(0, needed - distractors.length)];
    } else {
      distractors = distractors.slice(0, needed);
    }

    setCurrentOptions(shuffleArray([...distractors, correct]));
  }, [currentIndex, questions, gameState]);

  const handleAnswer = (capital: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(capital);
    if (capital === questions[currentIndex].capital) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      setGameState('finished');
    }
  };

  const restart = () => setGameState('start');

  // Styles Globais do Tema
  const s = {
    bg: isDarkMode ? 'bg-slate-900' : 'bg-slate-50',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-800',
    textSecondary: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    card: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100',
    cardShadow: isDarkMode ? 'shadow-none' : 'shadow-lg shadow-slate-200/50',
    highlightText: isDarkMode ? 'text-indigo-400' : 'text-indigo-900',
    subtleHighlight: isDarkMode ? 'text-slate-400' : 'text-indigo-600',
    success: isDarkMode ? 'text-green-400' : 'text-green-600',
    error: isDarkMode ? 'text-red-400' : 'text-red-600',
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-500 ${s.bg} ${s.text}`}>
      
      {/* Background FX */}
      <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-indigo-900/20' : 'bg-indigo-200/30'} -translate-x-1/2 -translate-y-1/2`} />
      <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-200/30'} translate-x-1/2 translate-y-1/2`} />

      <Header 
        isDark={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        onExit={restart} 
        isPlaying={gameState === 'playing'}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto p-6 flex flex-col justify-center relative z-10">
        
        {/* TELA INICIAL */}
        {gameState === 'start' && (
          <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
              <span className={`font-semibold tracking-wider text-sm uppercase ${s.subtleHighlight}`}>Bem-vindo ao desafio</span>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                Explore o mundo, <br />
                <span className={`font-bold ${s.highlightText}`}>uma capital por vez.</span>
              </h2>
              <p className={`max-w-md text-lg leading-relaxed ${s.textSecondary}`}>
                Selecione uma região abaixo para iniciar o quiz completo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['América do Sul', 'Europa', 'Ásia', 'América do Norte', 'América Central', 'África', 'Oceania', 'Todos'].map((c) => (
                <button
                  key={c}
                  onClick={() => startQuiz(c as Continent)}
                  className={`group border rounded-xl p-5 flex items-center justify-between transition-all duration-300 ${s.card} ${isDarkMode ? 'hover:bg-slate-700 hover:border-slate-600' : 'hover:bg-indigo-50 hover:border-indigo-200 shadow-sm hover:shadow-md'}`}
                >
                  <span className={`font-medium ${isDarkMode ? 'group-hover:text-white' : 'group-hover:text-indigo-800'}`}>{c}</span>
                  <div className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-700 group-hover:bg-slate-600' : 'bg-indigo-100 group-hover:bg-indigo-100'}`}>
                    <ArrowRight className={`w-4 h-4 ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-indigo-600'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TELA JOGO */}
        {gameState === 'playing' && questions[currentIndex] && (
          <div className="animate-fade-in w-full">
            <ProgressBar current={currentIndex} total={questions.length} isDark={isDarkMode} />

            <div className={`mb-10 rounded-2xl p-8 border transition-colors ${s.card} ${s.cardShadow}`}>
              <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-4 ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-indigo-50 text-indigo-600'}`}>
                {questions[currentIndex].continent}
              </span>
              <h2 className="text-3xl leading-tight">
                Qual é a capital de <span className={`font-bold ${s.highlightText}`}>{questions[currentIndex].name}</span>?
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentOptions.map((opt, idx) => (
                <OptionButton 
                  key={opt.capital}
                  option={opt}
                  idx={idx}
                  isDark={isDarkMode}
                  isAnswered={isAnswered}
                  isSelected={selectedAnswer === opt.capital}
                  isCorrect={opt.capital === questions[currentIndex].capital}
                  onSelect={() => handleAnswer(opt.capital)}
                />
              ))}
            </div>

            <div className="mt-8 h-12 flex items-center justify-end">
              {isAnswered && (
                <button
                  onClick={nextQuestion}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 hover:gap-3 ${isDarkMode ? 'bg-slate-200 text-slate-900 hover:bg-white shadow-lg' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30'}`}
                >
                  {currentIndex + 1 === questions.length ? 'Ver Resultado' : 'Próxima'} 
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* TELA FINAL */}
        {gameState === 'finished' && (
          <div className={`text-center space-y-8 animate-fade-in p-8 rounded-3xl border transition-colors ${s.card} ${s.cardShadow}`}>
            <div className="space-y-2">
               <span className={`font-bold uppercase tracking-widest text-xs ${s.subtleHighlight}`}>Resultado Final</span>
              <h2 className="text-6xl font-bold tracking-tighter">
                {Math.round((score / questions.length) * 100)}%
              </h2>
            </div>

            <div className={`py-6 border-y grid grid-cols-2 gap-8 max-w-sm mx-auto ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <div>
                <p className={`text-3xl font-bold ${s.success}`}>{score}</p>
                <p className={`text-xs uppercase mt-1 font-bold ${s.textSecondary}`}>Acertos</p>
              </div>
              <div>
                <p className={`text-3xl font-bold ${s.error}`}>{questions.length - score}</p>
                <p className={`text-xs uppercase mt-1 font-bold ${s.textSecondary}`}>Erros</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => startQuiz(selectedContinent)}
                className={`w-full py-4 rounded-xl transition-all font-bold flex items-center justify-center gap-2 shadow-lg ${isDarkMode ? 'bg-slate-200 text-slate-900 hover:bg-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'}`}
              >
                <RotateCcw className="w-5 h-5" />
                Jogar Novamente
              </button>
              <button
                onClick={restart}
                className={`w-full py-4 border-2 rounded-xl transition-all font-bold flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-indigo-50'}`}
              >
                <Home className="w-5 h-5" />
                Voltar ao Início
              </button>
            </div>
          </div>
        )}

      </main>
      
      <footer className={`p-6 text-center text-xs relative z-10 ${s.textSecondary}`}>
        © 2024 Quiz Capitais
      </footer>
    </div>
  );
}