import { type Encuadre, pista, golpes, trayectoria } from "@/lib/pista";

/** Pista esquemática en perspectiva. Decorativa: el contenido está en HTML. */
export function CourtSvg({
  e,
  className,
  conFocos = true,
  conTrazas = false,
}: {
  e: Encuadre;
  className?: string;
  conFocos?: boolean;
  conTrazas?: boolean;
}) {
  const g = pista(e);
  const repes = [0.18, -0.16, 0.32];
  return (
    <svg
      className={className}
      viewBox={`0 0 ${e.w} ${e.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`suelo-${e.w}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f2a66" />
          <stop offset="1" stopColor="#1d4fbf" />
        </linearGradient>
        <radialGradient id={`halo-${e.w}`}>
          <stop offset="0" stopColor="#f6f8ff" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#dfe8ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#dfe8ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="court__glass">
        <polygon points={g.cristalFondo} />
        {g.cristalLados.map((p, i) => <polygon key={i} points={p} />)}
        {g.mallaLados.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
      <polygon className="court__floor" points={g.suelo} fill={`url(#suelo-${e.w})`} />
      <g className="court__lines">
        {g.lineas.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
      <g className="court__net">
        <line x1={g.red[0][0]} y1={g.red[0][1]} x2={g.red[1][0]} y2={g.red[1][1]} />
        {g.redPoste.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
      {conFocos && (
        <g className="court__lights">
          {g.focos.map((f) => (
            <g key={f.i} className="light" style={{ ["--n" as string]: f.i }}>
              <line className="light__pole" x1={f.base[0]} y1={f.base[1]} x2={f.cabeza[0]} y2={f.cabeza[1]} />
              <circle className="light__halo" cx={f.cabeza[0]} cy={f.cabeza[1]} r={f.escala * 2.4} fill={`url(#halo-${e.w})`} />
              <circle className="light__head" cx={f.cabeza[0]} cy={f.cabeza[1]} r={Math.max(3, f.escala * 0.16)} />
            </g>
          ))}
        </g>
      )}
      {conTrazas && (
        <g className="traces">
          {golpes.map((s, i) => {
            const desvios = s.id === "repeticion" ? repes : [0];
            return desvios.map((dv, k) => {
              const t = trayectoria(e, s.x, s.z, dv);
              const inicio = 0.06 + i * 0.1 + k * 0.025;
              return (
                <g key={`${s.id}-${k}`} className="trace" style={{ ["--t0" as string]: inicio }}>
                  <path d={t.d} pathLength={1} />
                  <circle cx={t.fin[0]} cy={t.fin[1]} r={e.w > e.h ? 7 : 9} />
                </g>
              );
            });
          })}
        </g>
      )}
    </svg>
  );
}
