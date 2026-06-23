/**
 * @vitest-environment jsdom
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES_DB } from '../data/countries';
import { ContinentsSelection } from './ContinentsSelection';
import { CountryAutocomplete } from './CountryAutocomplete';
import { DailyResultCard } from './DailyResultCard';
import { Header } from './Header';
import { HelpModal } from './HelpModal';
import { InputAnswer } from './InputAnswer';
import { OptionButton } from './OptionButton';
import { PixelatedFlag } from './PixelatedFlag';
import { PracticeModes } from './PracticeModes';
import { ProgressBar } from './ProgressBar';
import { StatsModal } from './StatsModal';

const firstCountry = COUNTRIES_DB[0];

describe('basic components', () => {
    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    it('renders header actions', () => {
        const onOpenHelp = vi.fn();
        const onOpenStats = vi.fn();

        render(<Header onOpenHelp={onOpenHelp} onOpenStats={onOpenStats} />);
        const buttons = screen.getAllByRole('button');

        fireEvent.click(buttons[0]);
        fireEvent.click(buttons[1]);

        expect(onOpenHelp).toHaveBeenCalledOnce();
        expect(onOpenStats).toHaveBeenCalledOnce();
        expect(screen.getByText('CAPITAIS')).toBeInTheDocument();
    });

    it('selects continents and returns back', () => {
        const onBack = vi.fn();
        const onSelect = vi.fn();

        render(<ContinentsSelection onBack={onBack} onSelect={onSelect} />);

        fireEvent.click(screen.getAllByRole('button')[0]);
        fireEvent.click(screen.getByText('Todos'));

        expect(onBack).toHaveBeenCalledOnce();
        expect(onSelect).toHaveBeenCalledWith('Todos');
    });

    it('selects practice modes', () => {
        const onSelectMode = vi.fn();

        render(<PracticeModes onSelectMode={onSelectMode} />);

        fireEvent.click(screen.getAllByRole('button')[0]);

        expect(onSelectMode).toHaveBeenCalledWith('classic');
    });

    it('filters countries through autocomplete with keyboard and mouse', () => {
        const onSelect = vi.fn();

        render(<CountryAutocomplete onSelect={onSelect} placeholder="Pais" />);
        const input = screen.getByPlaceholderText('Pais');

        fireEvent.change(input, { target: { value: firstCountry.name.slice(0, 3) } });
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowUp' });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onSelect).toHaveBeenCalled();

        fireEvent.change(input, { target: { value: firstCountry.name.slice(0, 3) } });
        fireEvent.focus(input);
        fireEvent.click(screen.getAllByRole('button')[0]);

        expect(onSelect).toHaveBeenCalledTimes(2);

        fireEvent.change(input, { target: { value: firstCountry.name.slice(0, 3) } });
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('submits typed answers and advances after answered state', () => {
        const onSubmit = vi.fn();
        const nextQuestion = vi.fn();

        const { rerender } = render(
            <InputAnswer
                onSubmit={onSubmit}
                isAnswered={false}
                correctAnswer="Brasilia"
                acceptedAnswers={['Brasília']}
                nextQuestion={nextQuestion}
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Brasília' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onSubmit).toHaveBeenCalledWith('Brasília');

        rerender(
            <InputAnswer
                onSubmit={onSubmit}
                isAnswered
                correctAnswer="Brasilia"
                acceptedAnswers={['Brasília']}
                nextQuestion={nextQuestion}
            />
        );
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
        fireEvent.click(screen.getByText(/PR/));

        expect(nextQuestion).toHaveBeenCalledTimes(2);
    });

    it('shows wrong typed answers', () => {
        render(
            <InputAnswer
                onSubmit={vi.fn()}
                isAnswered
                correctAnswer="Brasilia"
                nextQuestion={vi.fn()}
            />
        );

        expect(screen.getByText('Brasilia')).toBeInTheDocument();
    });

    it('renders option button states', () => {
        const onSelect = vi.fn();

        const { rerender } = render(
            <OptionButton
                option={firstCountry}
                idx={0}
                isSelected={false}
                isCorrect={false}
                isAnswered={false}
                onSelect={onSelect}
                mode="classic"
            />
        );
        fireEvent.click(screen.getByRole('button'));
        expect(onSelect).toHaveBeenCalledOnce();
        expect(screen.getByText(firstCountry.capital)).toBeInTheDocument();

        rerender(
            <OptionButton
                option={firstCountry}
                idx={0}
                isSelected
                isCorrect={false}
                isAnswered
                onSelect={onSelect}
                mode="reverse"
            />
        );
        expect(screen.getByText(firstCountry.name)).toBeInTheDocument();

        rerender(
            <OptionButton
                option={firstCountry}
                idx={0}
                isSelected={false}
                isCorrect
                isAnswered
                onSelect={onSelect}
                mode="flags"
            />
        );
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders progress and modals', () => {
        const onClose = vi.fn();
        const onRestart = vi.fn();

        render(<ProgressBar current={2} total={4} />);
        expect(document.querySelector('[style*="50%"]')).toBeInTheDocument();

        render(<HelpModal onClose={onClose} />);
        fireEvent.click(screen.getByLabelText('Fechar modal'));
        expect(onClose).toHaveBeenCalledOnce();

        render(
            <StatsModal
                onClose={onClose}
                onRestart={onRestart}
                gameState="finished"
                score={150}
                correctCount={3}
                totalQuestions={5}
                stats={{
                    totalGames: 2,
                    totalCorrect: 4,
                    totalQuestions: 5,
                    bestStreak: 3,
                    totalScore: 400,
                }}
            />
        );
        fireEvent.click(screen.getByText('Jogar Novamente'));

        expect(onRestart).toHaveBeenCalledOnce();
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('renders daily result states', () => {
        const onNextChallenge = vi.fn();

        const { rerender } = render(
            <DailyResultCard
                gameStatus="won"
                countryName="Brasil"
                timeLeftStr="12:00"
                onNextChallenge={onNextChallenge}
            />
        );

        fireEvent.click(screen.getByText(/Proximo/));
        expect(onNextChallenge).toHaveBeenCalledOnce();

        rerender(
            <DailyResultCard
                gameStatus="lost"
                countryName="Brasil"
                timeLeftStr="12:00"
                onNextChallenge={onNextChallenge}
            />
        );
        expect(screen.getByText('Brasil')).toBeInTheDocument();
    });

    it('loads and draws pixelated flags', () => {
        const getContext = vi.fn(() => ({
            clearRect: vi.fn(),
            drawImage: vi.fn(),
            imageSmoothingEnabled: true,
        }));
        HTMLCanvasElement.prototype.getContext = getContext as unknown as typeof HTMLCanvasElement.prototype.getContext;

        class MockImage {
            crossOrigin = '';
            naturalWidth = 320;
            naturalHeight = 213;
            onload: (() => void) | null = null;
            set src(_value: string) {
                queueMicrotask(() => this.onload?.());
            }
        }

        vi.stubGlobal('Image', MockImage);

        render(<PixelatedFlag countryCode="br" attempt={5} />);

        return waitFor(() => {
            expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
            expect(getContext).toHaveBeenCalled();
        });
    });
});
