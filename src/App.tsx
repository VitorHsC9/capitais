import { useState, useEffect, type ElementType } from 'react';
import { 
  ArrowRight, RotateCcw, Home, Trophy, Flame, 
  BarChart3, Lock, CheckCircle2, Globe, Target, Footprints, Flag, MapPin, Building2, Zap, Skull 
} from 'lucide-react';

import { useQuizGame } from './hooks/useQuizGame';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { OptionButton } from './components/OptionButton';
import type { Continent } from './data/countries';
import { ACHIEVEMENTS_DB } from './data/achievements';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz-theme');
      return saved === 'dark';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('quiz-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.style.colorScheme = 'dark';
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.style.colorScheme = 'light';
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const game = useQuizGame();

  const getIcon = (iconName: string, className: string) => {
    const icons: Record<string, ElementType> = { Globe, Target, Trophy, Flame, Footprints };
    const IconComp = icons[iconName] || Trophy;
    return <IconComp className={className} />;
  };

  const s = {
    bg: isDarkMode ? 'bg-zinc-950' : 'bg-white', 
    text: isDarkMode ? 'text-zinc-100' : 'text-slate-900',
    textSecondary: isDarkMode ? 'text-zinc-400' : 'text-slate-600',
    card: isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200',
    cardShadow: isDarkMode ? 'shadow-none' : 'shadow-xl shadow-slate-300/50',
    highlightText: isDarkMode ? 'text-blue-400' : 'text-blue-700',
    subtleHighlight: isDarkMode ? 'text-zinc-500' : 'text-blue-600',
    success: isDarkMode ? 'text-emerald-400' : 'text-green-700',
    error: isDarkMode ? 'text-rose-400' : 'text-red-700',
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-500 ${s.bg} ${s.text}`}>
      
      {/* Background FX */}
      <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-200/30'} -translate-x-1/2 -translate-y-1/2`} />
      <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none transition-colors duration-700 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-200/30'} translate-x-1/2 translate-y-1/2`} />

      {/* --- TOASTS --- */}
      <div className="fixed top-24 right-0 left-0 flex flex-col items-center gap-2 z-50 pointer-events-none px-4">
        {game.newAchievements.map((ach) => (
          <div key={ach.id} className="animate-bounce-in bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded shadow-2xl flex items-center gap-3 max-w-sm w-full pointer-events-auto">
            <div className="bg-yellow-200 p-2 rounded-full">
              <Trophy className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="font-bold text-sm">Conquista Desbloqueada!</p>
              <p className="text-xs">{ach.title}</p>
            </div>
          </div>
        ))}
      </div>

      <Header 
        isDark={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        onExit={game.restart} 
        isPlaying={game.gameState === 'playing'}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto p-6 flex flex-col justify-center relative z-10">
        
        {/* === TELA INICIAL === */}
        {game.gameState === 'start' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <span className={`font-semibold tracking-wider text-sm uppercase ${s.subtleHighlight}`}>Bem-vindo ao desafio</span>
                <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                  Explore o mundo, <br />
                  <span className={`font-bold ${s.highlightText}`}>uma questão por vez.</span>
                </h2>
              </div>
              <button onClick={game.goToStats} className={`p-3 rounded-xl border transition-all ${s.card} ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-50 text-slate-500'}`}>
                <BarChart3 className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
               <span className={`text-xs font-bold uppercase tracking-wider ${s.textSecondary}`}>Modo de Jogo</span>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => game.setGameMode('classic')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${game.gameMode === 'classic' ? (isDarkMode ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-500 text-blue-700') : s.card}`}><MapPin className="w-6 h-6" /><div className="flex flex-col items-center leading-none"><span className="text-[10px] uppercase font-bold opacity-70">Países &rarr;</span><span className="font-bold">Capitais</span></div></button>
                  <button onClick={() => game.setGameMode('reverse')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${game.gameMode === 'reverse' ? (isDarkMode ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-500 text-blue-700') : s.card}`}><Building2 className="w-6 h-6" /><div className="flex flex-col items-center leading-none"><span className="text-[10px] uppercase font-bold opacity-70">Capitais &rarr;</span><span className="font-bold">Países</span></div></button>
                  <button onClick={() => game.setGameMode('flags')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${game.gameMode === 'flags' ? (isDarkMode ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-500 text-blue-700') : s.card}`}><Flag className="w-6 h-6" /><div className="flex flex-col items-center leading-none"><span className="text-[10px] uppercase font-bold opacity-70">Quiz de</span><span className="font-bold">Bandeiras</span></div></button>
                  <button onClick={() => game.setGameMode('suddenDeath')} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${game.gameMode === 'suddenDeath' ? (isDarkMode ? 'bg-red-900/30 border-red-500 text-red-400' : 'bg-red-50 border-red-500 text-red-700') : s.card}`}><Zap className="w-6 h-6" /><div className="flex flex-col items-center leading-none"><span className="text-[10px] uppercase font-bold opacity-70">5 Segundos</span><span className="font-bold">Morte Súbita</span></div></button>
               </div>
            </div>

            <div className="space-y-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${s.textSecondary}`}>Selecione a Região</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['América do Sul', 'Europa', 'Ásia', 'América do Norte', 'América Central', 'África', 'Oceania', 'Todos'].map((c) => (
                  <button
                    key={c}
                    onClick={() => game.startQuiz(c as Continent)}
                    className={`group border rounded-xl p-4 flex items-center justify-between transition-all duration-300 ${s.card} ${isDarkMode ? 'hover:bg-slate-700 hover:border-slate-600' : 'hover:bg-blue-50 hover:border-blue-200 shadow-sm hover:shadow-md'}`}
                  >
                    <span className={`font-medium ${isDarkMode ? 'group-hover:text-white' : 'group-hover:text-blue-800'}`}>{c}</span>
                    <ArrowRight className={`w-4 h-4 ${isDarkMode ? 'text-slate-300 group-hover:text-white' : 'text-blue-600'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === TELA ESTATÍSTICAS === */}
        {game.gameState === 'stats' && (
           <div className="animate-fade-in w-full space-y-8">
             <div className="flex items-center gap-3 mb-6">
                <button onClick={game.restart} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10`}>
                   <ArrowRight className="w-6 h-6 rotate-180" />
                </button>
                <h2 className="text-3xl font-bold">Meu Progresso</h2>
             </div>
             {/* ... (mantido igual, apenas resumindo para caber) ... */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Jogos', val: game.stats.totalGames, icon: <RotateCcw className="w-4 h-4" /> },
                  { label: 'Acertos', val: game.stats.totalCorrect, icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
                  { label: 'Melhor Streak', val: game.stats.bestStreak, icon: <Flame className="w-4 h-4 text-orange-500" /> },
                  { label: 'Score Total', val: game.stats.totalScore, icon: <Trophy className="w-4 h-4 text-yellow-500" /> },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${s.card} flex flex-col gap-2`}>
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase ${s.textSecondary}`}>
                      {item.icon} {item.label}
                    </div>
                    <span className="text-2xl font-bold">{item.val}</span>
                  </div>
                ))}
             </div>
             {/* Lista de Conquistas (mantida igual) */}
             <div className="space-y-4">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${s.subtleHighlight}`}>Conquistas</h3>
                <div className="grid grid-cols-1 gap-3">
                   {ACHIEVEMENTS_DB.map((ach) => {
                      const isUnlocked = game.stats.unlockedAchievements.includes(ach.id);
                      return (
                        <div key={ach.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${s.card} ${isUnlocked ? (isDarkMode ? 'border-green-900/50 bg-green-900/10' : 'border-green-200 bg-green-50') : 'opacity-60 grayscale'}`}>
                           <div className={`p-3 rounded-full ${isUnlocked ? (isDarkMode ? 'bg-green-900 text-green-400' : 'bg-green-100 text-green-600') : (isDarkMode ? 'bg-zinc-800' : 'bg-slate-100')}`}>
                              {isUnlocked ? getIcon(ach.icon, "w-6 h-6") : <Lock className="w-6 h-6" />}
                           </div>
                           <div className="flex-1">
                              <h4 className={`font-bold ${isUnlocked ? '' : s.textSecondary}`}>{ach.title}</h4>
                              <p className={`text-sm ${s.textSecondary}`}>{ach.description}</p>
                           </div>
                           {isUnlocked && <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-green-500' : 'text-green-600'}`} />}
                        </div>
                      )
                   })}
                </div>
             </div>
           </div>
        )}

        {/* === TELA JOGO === 
            Alteração principal: Usamos (playing OU game_over) para manter o jogo renderizado no fundo 
        */}
        {(game.gameState === 'playing' || game.gameState === 'game_over') && game.questions[game.currentIndex] && (
          <div className="animate-fade-in w-full relative">
            
            {/* Header do Jogo */}
            <div className="flex justify-between items-end mb-6 px-1">
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${s.textSecondary}`}>Pontuação</span>
                <span className={`text-2xl font-bold tabular-nums ${s.highlightText}`}>{game.score}</span>
              </div>
              {game.streak > 1 ? (
                <div className="flex items-center gap-2 animate-pulse text-orange-500">
                  <span className="font-bold text-xl tabular-nums">{game.streak}x</span>
                  <Flame className="w-6 h-6 fill-orange-500" />
                </div>
              ) : (
                <div className={`text-sm font-medium ${s.textSecondary}`}>Sem sequência</div>
              )}
            </div>

            {/* Temporizador Morte Súbita */}
            {game.gameMode === 'suddenDeath' && (
              <div className="flex justify-center mb-6">
                <div className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center border-4 text-4xl font-bold transition-all duration-300
                  ${game.timeLeft <= 2 ? 'border-red-500 text-red-500 scale-110' : (isDarkMode ? 'border-zinc-700' : 'border-slate-200')}
                `}>
                  {game.timeLeft}
                  <span className="absolute -bottom-6 text-xs font-bold uppercase tracking-widest opacity-50">Segundos</span>
                </div>
              </div>
            )}

            <ProgressBar current={game.currentIndex} total={game.questions.length} isDark={isDarkMode} />

            {/* Cartão da Pergunta */}
            <div className={`mb-8 rounded-2xl p-8 border transition-colors ${s.card} ${s.cardShadow}`}>
              <div className="flex flex-col items-center gap-6">
                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap shadow-sm border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-600' : 'bg-white text-blue-600 border-slate-100'}`}>
                    {game.questions[game.currentIndex].continent}
                </span>

                {game.gameMode === 'flags' && (
                  <div className="relative group">
                    <div className={`absolute inset-0 rounded-lg blur opacity-25 ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                    <img
                      src={`https://flagcdn.com/w160/${game.questions[game.currentIndex].code}.png`}
                      srcSet={`https://flagcdn.com/w320/${game.questions[game.currentIndex].code}.png 2x`}
                      alt={`Bandeira de ${game.questions[game.currentIndex].name}`}
                      className="relative h-28 w-auto rounded-lg shadow-lg object-cover border border-slate-200 dark:border-slate-600 transform transition-transform group-hover:scale-105 duration-300"
                    />
                  </div>
                )}

                <h2 className="text-3xl leading-tight text-center mt-2">
                  {(game.gameMode === 'classic' || game.gameMode === 'suddenDeath') && (
                    <>Qual é a capital de <span className={`font-bold ${s.highlightText}`}>{game.questions[game.currentIndex].name}</span>?</>
                  )}
                  {game.gameMode === 'reverse' && (
                    <>De qual país <span className={`font-bold ${s.highlightText}`}>{game.questions[game.currentIndex].capital}</span> é a capital?</>
                  )}
                  {game.gameMode === 'flags' && (
                    <>De qual país é <span className={`font-bold ${s.highlightText}`}>esta bandeira</span>?</>
                  )}
                </h2>
              </div>
            </div>

            {/* Opções de Resposta */}
            <div className="grid grid-cols-1 gap-3">
              {game.currentOptions.map((opt, idx) => (
                <OptionButton 
                  key={opt.name}
                  option={opt}
                  idx={idx}
                  isDark={isDarkMode}
                  isAnswered={game.isAnswered}
                  isSelected={game.selectedAnswer === ((game.gameMode === 'classic' || game.gameMode === 'suddenDeath') ? opt.capital : opt.name)}
                  isCorrect={
                    (game.gameMode === 'classic' || game.gameMode === 'suddenDeath')
                      ? opt.capital === game.questions[game.currentIndex].capital
                      : opt.name === game.questions[game.currentIndex].name
                  }
                  onSelect={() => game.handleAnswer((game.gameMode === 'classic' || game.gameMode === 'suddenDeath') ? opt.capital : opt.name)}
                  mode={game.gameMode === 'suddenDeath' ? 'classic' : game.gameMode}
                />
              ))}
            </div>

            <div className="mt-8 h-12 flex items-center justify-end">
              {game.isAnswered && game.gameMode !== 'suddenDeath' && game.gameState !== 'game_over' && (
                <button
                  onClick={game.nextQuestion}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 hover:gap-3 ${isDarkMode ? 'bg-slate-200 text-slate-900 hover:bg-white shadow-lg' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'}`}
                >
                  {game.currentIndex + 1 === game.questions.length ? 'Ver Resultado' : 'Próxima'} 
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              {game.isAnswered && game.gameMode === 'suddenDeath' && game.gameState !== 'game_over' && (
                 <div className="text-sm font-bold opacity-50 animate-pulse">Avançando...</div>
              )}
            </div>
          </div>
        )}

        {/* === MODAL DE GAME OVER (OVERLAY) === 
            Renderizado por cima do jogo usando 'fixed' e backdrop-blur 
        */}
        {game.gameState === 'game_over' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className={`relative w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-scale-up ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-slate-200'}`}>
              
              <div className="flex flex-col items-center text-center space-y-6">
                
                {/* Ícone */}
                <div className={`p-4 rounded-full ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                   <Skull className={`w-10 h-10 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">Fim de Jogo</h2>
                  <p className={`text-sm ${s.textSecondary}`}>
                    O tempo acabou ou você errou. Na Morte Súbita não há segundas chances.
                  </p>
                </div>

                {/* Estatísticas Rápidas */}
                <div className={`w-full py-4 border-y grid grid-cols-2 gap-4 ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
                  <div>
                    <p className={`text-2xl font-bold ${s.text}`}>{game.score}</p>
                    <p className={`text-[10px] uppercase font-bold opacity-50`}>Pontos</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${s.text}`}>{game.correctCount}</p>
                    <p className={`text-[10px] uppercase font-bold opacity-50`}>Acertos</p>
                  </div>
                </div>

                {/* Botões */}
                <div className="w-full space-y-3">
                  <button
                    onClick={() => game.startQuiz(game.selectedContinent)}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${isDarkMode ? 'bg-slate-200 text-slate-900 hover:bg-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Tentar Novamente
                  </button>
                  <button
                    onClick={game.restart}
                    className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border ${isDarkMode ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <Home className="w-4 h-4" />
                    Início
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* === TELA FINAL (VITÓRIA NORMAL) === */}
        {game.gameState === 'finished' && (
          <div className={`text-center space-y-8 animate-fade-in p-8 rounded-3xl border transition-colors ${s.card} ${s.cardShadow}`}>
            {/* ... Conteúdo de fim de jogo normal mantido ... */}
            <div className="space-y-1">
               <span className={`font-bold uppercase tracking-widest text-xs ${s.subtleHighlight}`}>Pontuação Final</span>
               <div className="flex items-center justify-center gap-3">
                  <Trophy className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                  <h2 className={`text-5xl font-bold tracking-tighter ${s.highlightText}`}>
                    {game.score}
                  </h2>
               </div>
            </div>

            <div className={`py-6 border-y grid grid-cols-3 gap-4 max-w-sm mx-auto ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <div>
                <p className={`text-2xl font-bold ${s.text}`}>{Math.round((game.correctCount / game.questions.length) * 100)}%</p>
                <p className={`text-[10px] uppercase mt-1 font-bold ${s.textSecondary}`}>Precisão</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${s.success}`}>{game.correctCount}</p>
                <p className={`text-[10px] uppercase mt-1 font-bold ${s.textSecondary}`}>Acertos</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${s.error}`}>{game.questions.length - game.correctCount}</p>
                <p className={`text-[10px] uppercase mt-1 font-bold ${s.textSecondary}`}>Erros</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => game.startQuiz(game.selectedContinent)}
                className={`w-full py-4 rounded-xl transition-all font-bold flex items-center justify-center gap-2 shadow-lg ${isDarkMode ? 'bg-slate-200 text-slate-900 hover:bg-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'}`}
              >
                <RotateCcw className="w-5 h-5" />
                Jogar Novamente
              </button>
              <button
                onClick={game.restart}
                className={`w-full py-4 border-2 rounded-xl transition-all font-bold flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-100 hover:border-blue-100 hover:bg-blue-50'}`}
              >
                <Home className="w-5 h-5" />
                Voltar ao Início
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className={`p-6 text-center text-xs relative z-10 ${s.textSecondary}`}>
        © 2025 JD Desenvolvimento
      </footer>
    </div>
  );
}