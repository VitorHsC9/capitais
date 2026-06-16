import { useEffect, useState } from 'react';

const formatTimeLeft = (targetTime: number) => {
    const distance = targetTime - Date.now();

    if (distance < 0) {
        return '00:00:00';
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function useCountdown(targetTime: number) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimeLeft = () => setTimeLeft(formatTimeLeft(targetTime));
        updateTimeLeft();

        const timer = setInterval(updateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [targetTime]);

    return timeLeft;
}
