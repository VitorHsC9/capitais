import confetti from 'canvas-confetti';
import { randomFloat, randomInRange } from './random';

export const triggerConfetti = () => {
    const duration = 2500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: randomFloat() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: randomFloat() - 0.2 } });
    }, 250);
};

export const triggerAchievementConfetti = () => {
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.1, x: 0.5 },
        colors: ['#FFC800', '#58CC02', '#1CB0F6']
    });
};
