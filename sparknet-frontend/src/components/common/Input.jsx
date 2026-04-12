export const Input = ({ label, error, ...props }) => (
  <div className="space-y-1">
    {label && <label className="text-[11px] font-headline text-slate-500 uppercase tracking-widest block font-bold mb-2">{label}</label>}
    <input className={`input-base w-full ${error ? 'border-error/60 focus:border-error focus:ring-error text-error' : ''}`} {...props} />
    {error && <p className="text-[11px] text-error font-medium mt-1 uppercase tracking-wide">{error}</p>}
  </div>
);
