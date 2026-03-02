import { Analytics } from '@vercel/analytics/react';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ChevronLeft, Trophy } from 'lucide-react';
import type { Achievement } from './data/achievements';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { useGameStore, type GameMode } from './hooks/useGameStore';
import { useStatistics } from './hooks/useStatistics';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { StatsModal } from './components/StatsModal';
import { ContinentsSelection } from './components/ContinentsSelection';
import { PlayingScreen } from './components/PlayingScreen';
import { NotFound } from './components/NotFound';
import { triggerConfetti, triggerAchievementConfetti } from './utils/confetti';

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

const SrsMenu = lazy(() => import('./components/srs/SrsMenu').then(module => ({ default: module.SrsMenu })));
const SrsFlashcard = lazy(() => import('./components/srs/SrsFlashcard').then(module => ({ default: module.SrsFlashcard })));
const SrsBrowser = lazy(() => import('./components/srs/SrsBrowser').then(module => ({ default: module.SrsBrowser })));
const OnlineLobby = lazy(() => import('./components/online/OnlineLobby').then(module => ({ default: module.OnlineLobby })));
import type { Continent } from './data/countries';


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
  const [modal, setModal] = useState<'none' | 'stats' | 'help'>('none');

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
  const hasUpdatedStatsRef = useRef(false);
  useEffect(() => {
    if (game.gameState === 'finished' || game.gameState === 'game_over') {
      if (!hasUpdatedStatsRef.current) {
        hasUpdatedStatsRef.current = true;
        updateStats({
          score: game.score,
          correctCount: game.correctCount,
          streak: game.maxStreak
        }, game.gameState === 'game_over' ? game.correctCount + 1 : game.questions.length);
      }

      if (game.gameState === 'finished') {
        triggerConfetti();
      }

      setTimeout(() => setModal('stats'), 800);
    } else {
      hasUpdatedStatsRef.current = false;
    }
  }, [game.gameState, game.score, game.correctCount, game.maxStreak, game.questions.length, updateStats]);

  // Confete de Achievement
  useEffect(() => {
    if (newAchievements.length > 0) {
      triggerAchievementConfetti();
    }
  }, [newAchievements]);



  return (
    <div className="flex flex-col h-screen mx-auto relative font-sans transition-colors duration-300 bg-[var(--bg-color)] overflow-hidden">
      <Analytics />

      {/* TOASTS */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] flex flex-col gap-2 w-full max-w-[320px] pointer-events-none px-4">
        {newAchievements.map((ach: Achievement) => (
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
        />

        <main className={`flex-1 flex flex-col py-4 px-4 overflow-hidden relative transition-all duration-300 w-full`}>
          <Suspense fallback={
            <div className="flex-1 flex flex-col items-center justify-center h-full animate-in fade-in duration-300">
              <Loader2 className="w-8 h-8 text-[var(--text-secondary)] animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Carregando...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />

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

              {/* SRS Routes */}
              <Route path="/srs" element={<SrsMenu />} />
              <Route path="/srs/study" element={<SrsFlashcard />} />
              <Route path="/srs/browser" element={<SrsBrowser />} />

              {/* Online Mode */}
              <Route path="/online" element={<OnlineLobby onBack={() => navigate('/')} />} />

              <Route path="/continents" element={<ContinentsSelection onBack={() => navigate('/practice')} onSelect={handleContinentSelect} />} />
              <Route path="/playing" element={<PlayingScreen />} />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>


      {/* MODAL HELP */}
      {modal === 'help' && (
        <HelpModal onClose={() => setModal('none')} />
      )}

      {/* MODAL STATS */}
      {modal === 'stats' && (
        <StatsModal
          onClose={() => setModal('none')}
          onRestart={handleRestart}
          gameState={game.gameState}
          score={game.score}
          correctCount={game.correctCount}
          totalQuestions={game.questions.length}
          stats={{
            totalGames: stats.totalGames,
            totalCorrect: stats.totalCorrect,
            totalQuestions: stats.totalQuestions,
            bestStreak: stats.bestStreak,
            totalScore: stats.totalScore
          }}
        />
      )}

    </div>
  );
}