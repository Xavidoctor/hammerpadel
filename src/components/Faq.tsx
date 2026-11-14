import { JsonLd } from "./JsonLd";

export type Pregunta = { p: string; r: string; pendiente?: boolean };

/**
 * Preguntas frecuentes con <details>: funciona sin JavaScript y con teclado.
 * Solo las respuestas confirmadas entran en el FAQPage de schema.org.
 */
export function Faq({ preguntas, id }: { preguntas: readonly Pregunta[]; id?: string }) {
  const confirmadas = preguntas.filter((q) => !q.pendiente);
  return (
    <>
      {confirmadas.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: confirmadas.map((q) => ({
              "@type": "Question",
              name: q.p,
              acceptedAnswer: { "@type": "Answer", text: q.r },
            })),
          }}
        />
      )}
      <div className="faq" id={id}>
        {preguntas.map((q) => (
          <details className="faq__item" key={q.p}>
            <summary>{q.p}</summary>
            <p className={q.pendiente ? "pending" : undefined}>{q.r}</p>
          </details>
        ))}
      </div>
    </>
  );
}
