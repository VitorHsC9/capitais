interface ProgressBarProps {
  current: number;
  total: number;
  isDark: boolean;
}

export const ProgressBar = ({ current, total, isDark }: ProgressBarProps) => (
  <div className={`flex items-center gap-4 text-sm font-medium mb-8 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
    <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>{String(current + 1).padStart(2, '0')}</span>
    <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
      <div 
        className={`h-full transition-all duration-500 ease-out rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`} 
        style={{ width: `${((current + 1) / total) * 100}%` }}
      />
    </div>
    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{String(total).padStart(2, '0')}</span>
  </div>
);