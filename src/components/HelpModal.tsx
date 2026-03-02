import { X } from 'lucide-react';

interface HelpModalProps {
    onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Como Jogar</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-[var(--text-secondary)]" /></button>
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
    );
}
