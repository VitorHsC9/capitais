import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-full flex items-center justify-center mb-6 shadow-inner">
                <AlertCircle className="w-12 h-12" />
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-4 drop-shadow-sm">
                404
            </h1>

            <p className="text-lg text-[var(--text-secondary)] font-medium mb-8 max-w-sm">
                Opa! Parece que você navegou para um território desconhecido no mapa.
            </p>

            <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-8 py-4 bg-[var(--text-primary)] text-[var(--bg-color)] font-black rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_6px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] transition-all uppercase tracking-widest flex items-center justify-center gap-3"
            >
                <Home className="w-5 h-5" />
                VOLTAR AO INÍCIO
            </button>
        </div>
    );
}
