import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { X, ChevronLeft, Trophy, Globe } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import { useGameStore, type GameMode } from './hooks/useGameStore';
import { useStatistics } from './hooks/useStatistics';
import { Header } from './components/Header';
import { OptionButton } from './components/OptionButton';
import { InputAnswer } from './components/InputAnswer';
import { ProgressBar } from './components/ProgressBar';

// Lazy loaded components (Code Splitting)
const Home = lazy(() => import('./components/Home').then(module => ({ default: module.Home })));
const DailyChallenge = lazy(() => import('./components/DailyChallenge').then(module => ({ default: module.DailyChallenge })));
const DailyAnagram = lazy(() => import('./components/DailyAnagram').then(module => ({ default: module.DailyAnagram })));
const DailyWordle = lazy(() => import('./components/DailyWordle').then(module => ({ default: module.DailyWordle })));
const DailyMap = lazy(() => import('./components/DailyMap').then(module => ({ default: module.DailyMap })));
const DailyCountry = lazy(() => import('./components/DailyCountry').then(module => ({ default: module.DailyCountry })));
const DailyMix = lazy(() => import('./components/DailyMix').then(module => ({ default: module.DailyMix })));
const DailyPopulation = lazy(() => import('./components/DailyPopulation').then(module => ({ default: module.DailyPopulation })));
const DailyCountryAnagram = lazy(() => import('./components/DailyCountryAnagram').then(module => ({ default: module.DailyCountryAnagram })));
const DailyCountryWordle = lazy(() => import('./components/DailyCountryWordle').then(module => ({ default: module.DailyCountryWordle })));
const PracticeModes = lazy(() => import('./components/PracticeModes').then(module => ({ default: module.PracticeModes })));
const SupremeMenu = lazy(() => import('./components/SupremeMenu').then(module => ({ default: module.SupremeMenu })));
const SupremeCapitals = lazy(() => import('./components/SupremeCapitals').then(module => ({ default: module.SupremeCapitals })));
const SupremeCountries = lazy(() => import('./components/SupremeCountries').then(module => ({ default: module.SupremeCountries })));
const SupremeFinal = lazy(() => import('./components/SupremeFinal').then(module => ({ default: module.SupremeFinal })));
import type { Continent } from './data/countries';

const shuffleText = (text: string) => {
  return text.split('').sort(() => Math.random() - 0.5).join('').toUpperCase();
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNextDailyChallenge = () => {
    const dailyOrder = ['/daily', '/daily-anagram', '/daily-wordle', '/daily-map', '/daily-country', '/daily-population', '/daily-country-anagram', '/daily-country-wordle', '/daily-mix'];
    const currentIndex = dailyOrder.indexOf(location.pathname);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % dailyOrder.length;
      navigate(dailyOrder[nextIndex]);
    } else {
      navigate('/');
    }
  };
  const [modal, setModal] = useState<'none' | 'stats' | 'help' | 'settings'>('none');
  const [highContrast, setHighContrast] = useState(false);

  const game = useGameStore();
  const { clearNotifications, updateStats, stats, newAchievements } = useStatistics();

  // Timer loop for Sudden Death
  useEffect(() => {
    if (game.gameMode !== 'suddenDeath' || game.gameState !== 'playing' || game.isAnswered) return;

    const timer = setInterval(() => {
      game.tickTimer();
    }, 1000);

    return () => clearInterval(timer);
  }, [game.gameState, game.gameMode, game.isAnswered, game.tickTimer]);

  useEffect(() => {
    if (game.timeLeft === 0 && game.gameMode === 'suddenDeath' && game.gameState === 'playing' && !game.isAnswered) {
      game.handleAnswer('TIME_UP');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.timeLeft, game.gameMode, game.gameState, game.isAnswered, game.handleAnswer]);

  const handleRestart = () => {
    clearNotifications();
    game.restart();
    navigate('/practice');
  };

  // Atalhos de Teclado Globais (1-4 para opções)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Impede atalhos numéricos no modo escrita ou anagrama (pois o usuário precisa digitar números talvez ou focar no input)
      if (location.pathname !== '/playing' || game.isAnswered || ['writing', 'anagram', 'daily'].includes(game.gameMode)) return;

      const key = e.key;
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const idx = parseInt(key) - 1;
        if (game.currentOptions[idx]) {
          const opt = game.currentOptions[idx];
          // Lógica para determinar qual campo enviar como resposta
          const isCapitalMode = ['classic', 'suddenDeath', 'survival'].includes(game.gameMode);
          game.handleAnswer(isCapitalMode ? opt.capital : opt.name);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname, game.isAnswered, game.currentOptions, game.gameMode]);

  // Aplica o tema
  useEffect(() => {
    if (highContrast) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');
  }, [highContrast]);

  const handleModeSelect = (mode: GameMode) => {
    game.setGameMode(mode);
    navigate('/continents');
  };

  const handleContinentSelect = (continent: Continent) => {
    clearNotifications();
    game.startQuiz(continent);
    navigate('/playing');
    setModal('none');
  };

  // Abre stats ao finalizar
  useEffect(() => {
    if (game.gameState === 'finished' || game.gameState === 'game_over') {
      updateStats({
        score: game.score,
        correctCount: game.correctCount,
        streak: game.maxStreak
      }, game.gameState === 'game_over' ? game.correctCount + 1 : game.questions.length);

      setTimeout(() => setModal('stats'), 800);
    }
  }, [game.gameState]);

  const continents: Continent[] = ['América do Sul', 'Europa', 'Ásia', 'América do Norte', 'América Central', 'África', 'Oceania', 'Todos'];

  return (
    <div className="flex flex-col h-screen mx-auto relative font-sans transition-colors duration-300 bg-[var(--bg-color)] overflow-hidden">
      <Analytics />

      {/* TOASTS */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] flex flex-col gap-2 w-full max-w-[320px] pointer-events-none px-4">
        {newAchievements.map((ach: any) => (
          <div key={ach.id} className="bg-[var(--surface-color)] text-[var(--text-primary)] p-4 rounded-xl font-bold shadow-[0_4px_0_rgba(0,0,0,0.2)] flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300 border-2 border-[var(--border-color)]">
            <div className="bg-[var(--color-primary)]/20 p-2 rounded-lg text-[var(--color-primary)]">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-60">Conquista</span>
              <span className="text-sm font-bold">{ach.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
        <Header
          onOpenHelp={() => setModal('help')}
          onOpenStats={() => setModal('stats')}
          onOpenSettings={() => setModal('settings')}
        />

        <main className={`flex-1 flex flex-col py-4 px-4 overflow-hidden relative transition-all duration-300 w-full`}>
          <Suspense fallback={
            <div className="flex-1 flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
              <Loader2 className="w-8 h-8 text-[var(--text-secondary)] animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Carregando...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={
                <Home
                  onSelectDaily={() => navigate('/daily')}
                  onSelectDailyAnagram={() => navigate('/daily-anagram')}
                  onSelectDailyWordle={() => navigate('/daily-wordle')}
                  onSelectDailyMap={() => navigate('/daily-map')}
                  onSelectDailyCountry={() => navigate('/daily-country')}
                  onSelectDailyPopulation={() => navigate('/daily-population')}
                  onSelectDailyCountryAnagram={() => navigate('/daily-country-anagram')}
                  onSelectDailyCountryWordle={() => navigate('/daily-country-wordle')}
                  onSelectDailyMix={() => navigate('/daily-mix')}
                  onSelectPractice={() => navigate('/practice')}
                  onSelectSupreme={() => navigate('/supreme-menu')}
                />
              } />

              <Route path="/supreme-menu" element={
                <SupremeMenu
                  onBack={() => navigate('/')}
                  onSelectCapitals={() => navigate('/supreme-capitals')}
                  onSelectCountries={() => navigate('/supreme-countries')}
                  onSelectFinal={() => navigate('/supreme-final')}
                />
              } />

              <Route path="/supreme-capitals" element={<SupremeCapitals onBack={() => navigate('/supreme-menu')} />} />
              <Route path="/supreme-countries" element={<SupremeCountries onBack={() => navigate('/supreme-menu')} />} />
              <Route path="/supreme-final" element={<SupremeFinal onBack={() => navigate('/supreme-menu')} />} />

              <Route path="/practice" element={
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => navigate('/')} className="btn-neutral w-10 h-10 rounded-xl">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </div>
                  <PracticeModes onSelectMode={handleModeSelect} />
                </div>
              } />

              <Route path="/daily" element={<DailyChallenge onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />
              <Route path="/daily-anagram" element={<DailyAnagram onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />
              <Route path="/daily-wordle" element={<DailyWordle onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />
              <Route path="/daily-map" element={<DailyMap onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />
              <Route path="/daily-country" element={<DailyCountry onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />
              <Route path="/daily-population" element={<DailyPopulation onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />
              <Route path="/daily-country-anagram" element={<DailyCountryAnagram onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />
              <Route path="/daily-country-wordle" element={<DailyCountryWordle onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />
              <Route path="/daily-mix" element={<DailyMix onBack={() => navigate('/')} onNextChallenge={handleNextDailyChallenge} />} />

              <Route path="/continents" element={
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/practice')} className="btn-neutral w-10 h-10 rounded-xl">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1">Configuração</h2>
                      <p className="text-xl font-black text-[var(--text-primary)]">Selecione a Região</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2">
                    {continents.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleContinentSelect(c)}
                        className="w-full text-left p-4 rounded-xl bg-[var(--surface-color)] hover:bg-[var(--bg-color)] border-2 border-[var(--border-color)] flex items-center justify-between transition-all active:scale-[0.98] hover:border-[var(--text-primary)] group"
                      >
                        <span className="font-bold text-sm text-[var(--text-primary)]">{c}</span>
                        <Globe className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                      </button>
                    ))}
                  </div>
                </div>
              } />

              <Route path="/playing" element={
                !game.questions[game.currentIndex] ? <Navigate to="/practice" replace /> : (
                  <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">

                    <div className="flex items-center justify-between bg-[var(--surface-color)] p-3 rounded-xl border-2 border-[var(--border-color)]">
                      <button onClick={() => { game.restart(); navigate('/practice'); }} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--color-error)] transition-colors">
                        <X className="w-4 h-4" /> Sair
                      </button>

                      <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="text-[var(--text-secondary)] uppercase tracking-wider">{game.questions[game.currentIndex]?.continent}</span>
                        <div className="bg-[var(--bg-color)] px-3 py-1 rounded-lg text-[var(--color-correct)] tabular-nums border-2 border-[var(--border-color)]">
                          {game.score} PTS
                        </div>
                      </div>
                    </div>

                    <ProgressBar current={game.currentIndex} total={game.questions.length} isDark={true} />

                    {/* ÁREA DA PERGUNTA */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 relative">

                      {game.gameMode === 'flags' && (
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-correct)] to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                          <img
                            src={`https://flagcdn.com/w320/${game.questions[game.currentIndex].code}.png`}
                            className="h-32 relative rounded-lg shadow-2xl border-2 border-[var(--border-color)]"
                            alt="Flag"
                          />
                        </div>
                      )}

                      <div className="text-center px-4 w-full">
                        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight text-[var(--text-primary)] drop-shadow-sm">
                          {(game.gameMode === 'classic' || game.gameMode === 'suddenDeath' || game.gameMode === 'survival') && game.questions[game.currentIndex].name}

                          {game.gameMode === 'writing' && game.questions[game.currentIndex].name}

                          {game.gameMode === 'reverse' && game.questions[game.currentIndex].capital}

                          {(game.gameMode === 'flags') && "QUE PAÍS É ESSE?"}

                          {game.gameMode === 'anagram' && (
                            <span className="tracking-[0.2em]">
                              {shuffleText(game.questions[game.currentIndex].capital)}
                            </span>
                          )}
                        </h2>
                        {game.gameMode === 'anagram' && <p className="text-sm mt-2 text-[var(--text-secondary)] font-bold">DESEMBARALHE A CAPITAL</p>}
                      </div>

                      {game.gameMode === 'suddenDeath' && (
                        <div className={`text-6xl font-black tabular-nums transition-colors duration-300 ${game.timeLeft <= 2 ? 'text-[var(--color-error)] animate-pulse' : 'text-[var(--text-secondary)]'}`}>
                          {game.timeLeft}
                        </div>
                      )}
                    </div>

                    {/* RESPOSTA */}
                    <div className="pb-2">
                      {['writing', 'anagram'].includes(game.gameMode) ? (
                        <InputAnswer
                          onSubmit={game.handleAnswer}
                          isAnswered={game.isAnswered}
                          correctAnswer={game.questions[game.currentIndex].capital}
                          nextQuestion={game.nextQuestion}
                          isDark={true}
                        />
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {game.currentOptions.map((opt, idx) => (
                            <OptionButton
                              key={opt.name}
                              option={opt}
                              idx={idx}
                              isAnswered={game.isAnswered}
                              isSelected={game.selectedAnswer === ((['classic', 'suddenDeath', 'survival'].includes(game.gameMode)) ? opt.capital : opt.name)}
                              isCorrect={
                                (['classic', 'suddenDeath', 'survival'].includes(game.gameMode))
                                  ? opt.capital === game.questions[game.currentIndex].capital
                                  : opt.name === game.questions[game.currentIndex].name
                              }
                              onSelect={() => game.handleAnswer((['classic', 'suddenDeath', 'survival'].includes(game.gameMode)) ? opt.capital : opt.name)}
                              mode={game.gameMode}
                              isDark={true}
                            />
                          ))}

                          {/* Botão Próximo */}
                          {game.isAnswered && game.gameState !== 'game_over' && game.gameState !== 'finished' && game.gameMode !== 'suddenDeath' && (
                            <button onClick={game.nextQuestion} className="w-full py-4 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all uppercase tracking-widest">
                              PRÓXIMA PERGUNTA
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              } />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* MODAL SETTINGS */}
      {modal === 'settings' && (
        <div className="modal-overlay" onClick={() => setModal('none')}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Configurações</h2>
              <button onClick={() => setModal('none')}><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-color)] border-2 border-[var(--border-color)]">
                <div>
                  <div className="font-bold text-sm text-[var(--text-primary)]">Alto Contraste</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">Melhora a visibilidade</div>
                </div>
                <button onClick={() => setHighContrast(!highContrast)} className={`switch ${highContrast ? 'checked' : ''}`}>
                  <span className="switch-thumb" />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-color)] border-2 border-[var(--border-color)] text-center">
                <p className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-1">Versão</p>
                <p className="text-sm font-mono text-[var(--text-primary)]">v2.1.0 (Daily)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HELP */}
      {modal === 'help' && (
        <div className="modal-overlay" onClick={() => setModal('none')}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Como Jogar</h2>
              <button onClick={() => setModal('none')}><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
            </div>

            <div className="space-y-4 text-sm text-[var(--text-secondary)]">
              <p className="text-[var(--text-primary)] font-medium">Teste seus conhecimentos sobre a geografia mundial.</p>

              <div className="grid gap-3">
                <div className="flex gap-3 items-start">
                  <span className="bg-[var(--surface-color)] w-6 h-6 flex items-center justify-center rounded font-bold text-xs border-2 border-[var(--border-color)] text-[var(--text-primary)]">1</span>
                  <span>Selecione um modo de jogo (Clássico, Bandeiras, etc).</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-[var(--surface-color)] w-6 h-6 flex items-center justify-center rounded font-bold text-xs border-2 border-[var(--border-color)] text-[var(--text-primary)]">2</span>
                  <span>Escolha uma região específica ou jogue com o mundo todo.</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-[var(--surface-color)] w-6 h-6 flex items-center justify-center rounded font-bold text-xs border-2 border-[var(--border-color)] text-[var(--text-primary)]">3</span>
                  <span>Responda rápido para manter a sequência de vitórias!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STATS */}
      {modal === 'stats' && (
        <div className="modal-overlay" onClick={() => game.gameState === 'playing' ? setModal('none') : null}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button onClick={() => {
                setModal('none');
                if (game.gameState === 'finished' || game.gameState === 'game_over') { handleRestart(); }
              }}>
                <X className="w-5 h-5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
              </button>
            </div>

            <div className="text-center">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-8 text-[var(--text-primary)]">Estatísticas</h2>

              <div className="grid grid-cols-4 gap-2 mb-8">
                {[
                  { label: 'Jogos', val: stats.totalGames },
                  { label: 'Vitórias', val: `${Math.round((stats.totalCorrect / (stats.totalQuestions || 1)) * 100) || 0}%` },
                  { label: 'Sequência', val: stats.bestStreak },
                  { label: 'Pontos', val: stats.totalScore || game.score }, // Usa totalScore das stats ou score da sessão
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{stat.val}</div>
                    <div className="text-[9px] uppercase font-bold text-[var(--text-secondary)] mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {(game.gameState === 'game_over' || game.gameState === 'finished') && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="p-4 bg-[var(--surface-color)] rounded-xl mb-4 border-2 border-[var(--border-color)]">
                    <p className="text-xs text-[var(--text-secondary)] uppercase font-bold mb-1">
                      {game.gameState === 'finished' ? 'Parabéns!' : 'Fim de Jogo'}
                    </p>
                    <p className="text-2xl font-black text-[var(--text-primary)]">
                      {game.correctCount} <span className="text-sm font-medium text-[var(--text-secondary)]">/ {game.questions.length}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { handleRestart(); setModal('none'); }}
                    className="w-full py-4 bg-[var(--color-correct)] text-white font-bold uppercase text-sm rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all"
                  >
                    Jogar Novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}