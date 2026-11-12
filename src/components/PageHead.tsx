export function PageHead({ kicker, titulo, children }: { kicker?: string; titulo: string; children?: React.ReactNode }) {
  return (
    <header className="page__head">
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h1 className="display">{titulo}</h1>
      {children}
    </header>
  );
}
