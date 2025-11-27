import { useEffect, useRef, useState } from 'react';

interface PixelatedFlagProps {
    countryCode: string;
    attempt: number; // 0 to 5 (0 = most pixelated, 5 = clear)
    maxAttempts?: number;
}

export function PixelatedFlag({ countryCode, attempt, maxAttempts = 5 }: PixelatedFlagProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Levels of pixelation (width in pixels)
    // Attempt 0: Very blocky (e.g., 4x3 pixels)
    // Attempt 4: Almost clear
    const PIXEL_LEVELS = [4, 8, 16, 32, 64, 320];

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = `https://flagcdn.com/w320/${countryCode}.png`;
        img.onload = () => {
            imgRef.current = img;
            setImageLoaded(true);
        };
    }, [countryCode]);

    useEffect(() => {
        if (!imageLoaded || !imgRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = imgRef.current;
        const width = canvas.width;
        const height = canvas.height;

        // Ensure image has dimensions
        if (img.naturalWidth === 0 || img.naturalHeight === 0) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Disable smoothing for pixelated effect
        ctx.imageSmoothingEnabled = false;

        // Calculate pixelation resolution
        // If attempt >= maxAttempts, show full resolution
        let pixelWidth = attempt >= maxAttempts ? 320 : PIXEL_LEVELS[Math.min(attempt, PIXEL_LEVELS.length - 1)];

        // Fallback if pixelWidth is somehow undefined or invalid
        if (!pixelWidth || pixelWidth <= 0) pixelWidth = 4;

        // Calculate aspect ratio
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        const pixelHeight = Math.max(1, Math.floor(pixelWidth * aspectRatio));

        // Guard against invalid dimensions
        if (pixelWidth <= 0 || pixelHeight <= 0) return;

        // 1. Draw small (downscale)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = pixelWidth;
        tempCanvas.height = pixelHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.drawImage(img, 0, 0, pixelWidth, pixelHeight);

        // 2. Draw back to full size (upscale)
        ctx.drawImage(tempCanvas, 0, 0, pixelWidth, pixelHeight, 0, 0, width, height);

    }, [imageLoaded, attempt, countryCode, maxAttempts]);

    return (
        <div className="relative w-full max-w-[320px] aspect-[3/2] mx-auto rounded-lg overflow-hidden shadow-2xl border border-[var(--tone-4)] bg-[var(--tone-5)]">
            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-[var(--tone-3)] animate-pulse">
                    Carregando...
                </div>
            )}
            <canvas
                ref={canvasRef}
                width={320}
                height={213}
                className="w-full h-full object-cover rendering-pixelated"
                style={{ imageRendering: 'pixelated' }}
            />
        </div>
    );
}
