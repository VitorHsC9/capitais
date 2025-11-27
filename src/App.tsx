import { useState, useEffect } from 'react';
import {
  X, ChevronLeft, Trophy, Globe
} from 'lucide-react';

import { useQuizGame, type GameMode } from './hooks/useQuizGame';
import { Header } from './components/Header';
import { OptionButton } from './components/OptionButton';
import { InputAnswer } from './components/InputAnswer';
import { ProgressBar } from './components/ProgressBar';
import { DailyChallenge } from './components/DailyChallenge';
import { Home } from './components/Home';
import { PracticeModes } from './components/PracticeModes';
import type { Continent } from './data/countries';

const shuffleText = (text: string) => {
  return text.split('').sort(() => Math.random() - 0.5).join('').toUpperCase();
};

export default function App() {
  const [screen, setScreen] = useState<'home' | 'practice' | 'modes' | 'continents' | 'playing' | 'daily'>('home');
  const [modal, setModal] = useState<'none' | 'stats' | 'help' | 'settings'>('none');
  const [highContrast, setHighContrast] = useState(false);

  const game = useQuizGame();

  // Atalhos de Teclado Globais (1-4 para opções)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Impede atalhos numéricos no modo escrita ou anagrama (pois o usuário precisa digitar números talvez ou focar no input)
      if (screen !== 'playing' || game.isAnswered || ['writing', 'anagram', 'daily'].includes(game.gameMode)) return;

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
  }, [screen, game.isAnswered, game.currentOptions, game.gameMode]);

  // Aplica o tema
  useEffect(() => {
    if (highContrast) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');
  }, [highContrast]);

  const handleModeSelect = (mode: GameMode) => {
    if (mode === 'daily') {
      setScreen('daily');
      return;
    }
    game.setGameMode(mode);
    setScreen('continents');
  };

  const handleContinentSelect = (continent: Continent) => {
    game.startQuiz(continent);
    setScreen('playing');
    setModal('none');
  };

  // Abre stats ao finalizar
  useEffect(() => {
    if (game.gameState === 'finished' || game.gameState === 'game_over') {
      setTimeout(() => setModal('stats'), 800);
    }
  }, [game.gameState]);

  const continents: Continent[] = ['América do Sul', 'Europa', 'Ásia', 'América do Norte', 'América Central', 'África', 'Oceania', 'Todos'];

  return (
    <div className="flex flex-col h-screen max-w-[500px] mx-auto px-4 relative font-sans transition-colors duration-300">

      {/* TOASTS */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] flex flex-col gap-2 w-full max-w-[320px] pointer-events-none px-4">
        {game.newAchievements.map((ach) => (
          <div key={ach.id} className="bg-[var(--tone-5)] text-[var(--tone-1)] p-4 rounded-xl font-bold shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300 border border-[var(--tone-4)] ring-1 ring-black/5">
            <div className="bg-[var(--color-correct)]/20 p-2 rounded-lg text-[var(--color-correct)]">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-60">Conquista</span>
              <span className="text-sm font-bold">{ach.title}</span>
            </div>
          </div>
        ))}
      </div>

      <Header
        onOpenHelp={() => setModal('help')}
        onOpenStats={() => setModal('stats')}
        onOpenSettings={() => setModal('settings')}
      />

      <main className="flex-1 flex flex-col py-6 overflow-hidden relative">

        {/* HOME */}
        {screen === 'home' && (
          <Home
            onSelectDaily={() => setScreen('daily')}
            onSelectPractice={() => setScreen('practice')}
          />
        )}

        {/* PRACTICE MODES */}
        {screen === 'practice' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setScreen('home')} className="p-2 -ml-2 hover:bg-[var(--tone-5)] rounded-lg text-[var(--tone-2)] hover:text-[var(--tone-1)] transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <PracticeModes onSelectMode={handleModeSelect} />
          </div>
        )}

        {/* DESAFIO DIÁRIO */}
        {screen === 'daily' && (
          <DailyChallenge onBack={() => setScreen('home')} />
        )}

        {/* CONTINENTES */}
        {screen === 'continents' && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setScreen('practice')} className="p-2 -ml-2 hover:bg-[var(--tone-5)] rounded-lg text-[var(--tone-2)] hover:text-[var(--tone-1)] transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--tone-2)] mb-1">Configuração</h2>
                <p className="text-xl font-bold text-[var(--tone-1)]">Selecione a Região</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2">
              {continents.map((c) => (
                <button
                  key={c}
                  onClick={() => handleContinentSelect(c)}
                  className="w-full text-left p-4 rounded-xl bg-[var(--tone-5)] hover:bg-[var(--tone-4)] border border-[var(--tone-4)] flex items-center justify-between transition-all active:scale-[0.98] hover:border-[var(--tone-3)]"
                >
                  <span className="font-bold text-sm text-[var(--tone-1)]">{c}</span>
                  <Globe className="w-5 h-5 text-[var(--tone-3)]" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* JOGO */}
        {screen === 'playing' && (
          <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">

            <div className="flex items-center justify-between bg-[var(--tone-5)] p-3 rounded-xl border border-[var(--tone-4)]">
              <button onClick={() => { game.restart(); setScreen('practice'); }} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--tone-2)] hover:text-[var(--color-error)] transition-colors">
                <X className="w-4 h-4" /> Sair
              </button>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-[var(--tone-2)] uppercase tracking-wider">{game.questions[game.currentIndex]?.continent}</span>
                <div className="bg-[var(--bg-color)] px-3 py-1 rounded-lg text-[var(--color-correct)] tabular-nums border border-[var(--tone-4)]">
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
                    className="h-32 relative rounded-lg shadow-2xl border border-[var(--tone-4)]"
                    alt="Flag"
                  />
                </div>
              )}

              <div className="text-center px-4 w-full">
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight text-[var(--tone-1)] drop-shadow-sm">
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
                {game.gameMode === 'anagram' && <p className="text-sm mt-2 text-[var(--tone-3)] font-bold">DESEMBARALHE A CAPITAL</p>}
              </div>

              {game.gameMode === 'suddenDeath' && (
                <div className={`text-6xl font-black tabular-nums transition-colors duration-300 ${game.timeLeft <= 2 ? 'text-[var(--color-error)] animate-pulse' : 'text-[var(--tone-3)]'}`}>
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
                    <button onClick={game.nextQuestion} className="btn-termo py-4 w-full bg-[var(--tone-1)] text-[var(--bg-color)] font-black animate-pulse hover:scale-[1.02] shadow-lg">
                      PRÓXIMA PERGUNTA
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL SETTINGS */}
      {modal === 'settings' && (
        <div className="modal-overlay" onClick={() => setModal('none')}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--tone-2)]">Configurações</h2>
              <button onClick={() => setModal('none')}><X className="w-5 h-5 text-[var(--tone-2)]" /></button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--tone-4)]">
                <div>
                  <div className="font-bold text-sm">Alto Contraste</div>
                  <div className="text-[10px] text-[var(--tone-2)]">Melhora a visibilidade</div>
                </div>
                <button onClick={() => setHighContrast(!highContrast)} className={`switch ${highContrast ? 'checked' : ''}`}>
                  <span className="switch-thumb" />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-color)] border border-[var(--tone-4)] text-center">
                <p className="text-xs text-[var(--tone-3)] uppercase font-bold mb-1">Versão</p>
                <p className="text-sm font-mono text-[var(--tone-2)]">v2.1.0 (Daily)</p>
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
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--tone-2)]">Como Jogar</h2>
              <button onClick={() => setModal('none')}><X className="w-5 h-5 text-[var(--tone-2)]" /></button>
            </div>

            <div className="space-y-4 text-sm text-[var(--tone-2)]">
              <p className="text-[var(--tone-1)] font-medium">Teste seus conhecimentos sobre a geografia mundial.</p>

              <div className="grid gap-3">
                <div className="flex gap-3 items-start">
                  <span className="bg-[var(--tone-5)] w-6 h-6 flex items-center justify-center rounded font-bold text-xs border border-[var(--tone-4)]">1</span>
                  <span>Selecione um modo de jogo (Clássico, Bandeiras, etc).</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-[var(--tone-5)] w-6 h-6 flex items-center justify-center rounded font-bold text-xs border border-[var(--tone-4)]">2</span>
                  <span>Escolha uma região específica ou jogue com o mundo todo.</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-[var(--tone-5)] w-6 h-6 flex items-center justify-center rounded font-bold text-xs border border-[var(--tone-4)]">3</span>
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
                if (game.gameState === 'finished' || game.gameState === 'game_over') { game.restart(); setScreen('practice'); }
              }}>
                <X className="w-5 h-5 text-[var(--tone-2)] hover:text-[var(--tone-1)]" />
              </button>
            </div>

            <div className="text-center">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-8 text-[var(--tone-1)]">Estatísticas</h2>

              <div className="grid grid-cols-4 gap-2 mb-8">
                {[
                  { label: 'Jogos', val: game.stats.totalGames },
                  { label: 'Vitórias', val: `${Math.round((game.stats.totalCorrect / (game.stats.totalQuestions || 1)) * 100) || 0}%` },
                  { label: 'Sequência', val: game.stats.bestStreak },
                  { label: 'Pontos', val: game.stats.totalScore || game.score }, // Usa totalScore das stats ou score da sessão
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-xl sm:text-2xl font-bold text-[var(--tone-1)]">{stat.val}</div>
                    <div className="text-[9px] uppercase font-bold text-[var(--tone-3)] mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {(game.gameState === 'game_over' || game.gameState === 'finished') && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <div className="p-4 bg-[var(--tone-5)] rounded-xl mb-4 border border-[var(--tone-4)]">
                    <p className="text-xs text-[var(--tone-2)] uppercase font-bold mb-1">
                      {game.gameState === 'finished' ? 'Parabéns!' : 'Fim de Jogo'}
                    </p>
                    <p className="text-2xl font-black text-[var(--tone-1)]">
                      {game.correctCount} <span className="text-sm font-medium text-[var(--tone-3)]">/ {game.questions.length}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { game.restart(); setScreen('practice'); setModal('none'); }}
                    className="w-full py-4 bg-[var(--color-correct)] text-white font-bold uppercase text-sm rounded-xl shadow-lg hover:brightness-110 hover:shadow-emerald-500/20 transition-all"
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