interface ProgressBarProps {
  current: number;
  total: number;
  isDark: boolean;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => (
  <div className="w-full h-1 bg-[var(--tone-4)] rounded-full overflow-hidden">
    <div 
      className="h-full bg-[var(--tone-2)] transition-all duration-500 ease-out" 
      style={{ width: `${((current) / total) * 100}%` }}
    />
  </div>
);