type FeatureStatProps = {
  label: string;
  value?: string;
  unit?: string;
};

export default function FeatureStat({ label, value, unit }: FeatureStatProps) {
  return (
    <div className="flex flex-col items-end text-right">
      <span className="text-[11px] uppercase tracking-[0.18em] text-ink/55 leading-tight">{label}</span>
      {value && (
        <span className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-ink leading-none">
          {value}
          {unit && <span className="text-base md:text-lg text-accent ml-1 align-top">{unit}</span>}
        </span>
      )}
    </div>
  );
}
