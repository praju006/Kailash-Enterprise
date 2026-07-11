export default function Marquee({ items, dark = true }: { items: string[]; dark?: boolean }) {
  // Track content is duplicated once so the -50% translate loops seamlessly.
  const strip = (
    <>
      {items.map((item) => (
        <span key={item} className="inline-flex items-center">
          <span className="font-head text-[17px] tracking-[0.14em] uppercase px-7">{item}</span>
          <span className={`text-[11px] ${dark ? 'text-gold' : 'text-maroon'}`}>✦</span>
        </span>
      ))}
    </>
  );

  return (
    <div className={`marquee py-3.5 border-y ${dark ? 'bg-maroon-dark text-gold-pale border-gold/30' : 'bg-gold-pale text-maroon border-line'}`}>
      <div className="marquee-track" aria-hidden={false}>
        {strip}
        {strip}
      </div>
    </div>
  );
}
