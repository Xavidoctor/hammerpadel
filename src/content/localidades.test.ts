import { describe, expect, it } from "vitest";
import { localidades } from "./catalogo";
import { esIndexable, paginasLocalidad, type PaginaLocalidad } from "./localidades";
import { rutasLocalidad } from "@/app/sitemap";

const base: PaginaLocalidad = { id: "denia", nombre: "Dénia", keyword: "x", entrega: "e", local: null };
const completo = { zonas: ["Zona"], pistas: "Pistas", preguntas: [{ pregunta: "¿?", respuesta: "Sí" }] };

describe("páginas por localidad", () => {
  it("hay una página por cada localidad confirmada, con keyword propia", () => {
    expect(paginasLocalidad.map((p) => p.id)).toEqual(localidades.map((l) => l.id));
    expect(new Set(paginasLocalidad.map((p) => p.keyword)).size).toBe(localidades.length);
    for (const p of paginasLocalidad) expect(p.keyword).toContain(p.nombre);
  });

  it("sin datos locales no es indexable", () => {
    expect(esIndexable(base)).toBe(false);
    expect(esIndexable({ ...base, local: { ...completo, zonas: [] } })).toBe(false);
    expect(esIndexable({ ...base, local: { ...completo, pistas: " " } })).toBe(false);
    expect(esIndexable({ ...base, local: { ...completo, preguntas: [] } })).toBe(false);
  });

  it("con datos locales completos es indexable", () => {
    expect(esIndexable({ ...base, local: completo })).toBe(true);
  });

  it("el sitemap solo incluye las localidades indexables", () => {
    expect(rutasLocalidad).toEqual(paginasLocalidad.filter(esIndexable).map((p) => `/alquiler/${p.id}`));
  });
});
