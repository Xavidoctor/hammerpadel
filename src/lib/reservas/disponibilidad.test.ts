import { describe, expect, it } from "vitest";
import { choca, huecosDelDia, hhmm, margen, SIN_LOGISTICA } from "./disponibilidad";
import type { Logistica, Maquina, ReglaDisponibilidad, Reserva } from "./tipos";

// Datos de prueba, no horarios reales.
const M1: Maquina = { id: "m1", estado: "activa", ubicaciones: ["denia", "ondara"] };
const regla = (maquinaId: string): ReglaDisponibilidad => ({ maquinaId, diaSemana: 4, inicio: 9 * 60, fin: 13 * 60 });
const base = { fecha: "2026-11-19", diaSemana: 4, duracion: 90, paso: 30 };

const log: Logistica = {
  preparacion: 15,
  recogida: 15,
  traslado: (a, b) => (a === b ? 0 : 30),
};

describe("margen", () => {
  it("sin logística no hay margen", () => {
    expect(margen(SIN_LOGISTICA, "denia", "ondara")).toBe(0);
  });
  it("entre ubicaciones distintas suma recogida + traslado + preparación", () => {
    expect(margen(log, "denia", "ondara")).toBe(60);
  });
});

describe("choca", () => {
  const r = { ubicacionId: "denia", inicio: 600, fin: 690 };
  it("solapamiento directo", () => {
    expect(choca(SIN_LOGISTICA, { ubicacionId: "denia", inicio: 630, fin: 720 }, r)).toBe(true);
  });
  it("sesiones contiguas sin logística no chocan", () => {
    expect(choca(SIN_LOGISTICA, { ubicacionId: "denia", inicio: 690, fin: 780 }, r)).toBe(false);
  });
  it("con traslado, una sesión contigua en otra localidad sí choca", () => {
    expect(choca(log, { ubicacionId: "ondara", inicio: 690, fin: 780 }, r)).toBe(true);
    expect(choca(log, { ubicacionId: "ondara", inicio: 750, fin: 840 }, r)).toBe(false);
  });
});

describe("huecosDelDia", () => {
  it("sin reglas no hay huecos (nunca se inventan horarios)", () => {
    const h = huecosDelDia({ ...base, ubicacionId: "denia", maquinas: [M1], reglas: [], reservas: [], bloqueos: [] });
    expect(h).toEqual([]);
  });

  it("genera huecos de 90 min dentro del horario", () => {
    const h = huecosDelDia({ ...base, ubicacionId: "denia", maquinas: [M1], reglas: [regla("m1")], reservas: [], bloqueos: [] });
    expect(h.map((x) => hhmm(x.inicio))).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
  });

  it("una máquina no puede tener dos reservas a la vez", () => {
    const reservas: Reserva[] = [
      { id: "r1", maquinaId: "m1", ubicacionId: "denia", fecha: base.fecha, inicio: 600, fin: 690, estado: "confirmada" },
    ];
    const h = huecosDelDia({ ...base, ubicacionId: "denia", maquinas: [M1], reglas: [regla("m1")], reservas, bloqueos: [] });
    expect(h.map((x) => hhmm(x.inicio))).toEqual(["11:30"]);
  });

  it("las reservas canceladas liberan el hueco", () => {
    const reservas: Reserva[] = [
      { id: "r1", maquinaId: "m1", ubicacionId: "denia", fecha: base.fecha, inicio: 600, fin: 690, estado: "cancelada" },
    ];
    const h = huecosDelDia({ ...base, ubicacionId: "denia", maquinas: [M1], reglas: [regla("m1")], reservas, bloqueos: [] });
    expect(h).toHaveLength(6);
  });

  it("con varias máquinas asigna otra libre", () => {
    const M2: Maquina = { id: "m2", estado: "activa", ubicaciones: ["denia"] };
    const reservas: Reserva[] = [
      { id: "r1", maquinaId: "m1", ubicacionId: "denia", fecha: base.fecha, inicio: 600, fin: 690, estado: "confirmada" },
    ];
    const h = huecosDelDia({ ...base, ubicacionId: "denia", maquinas: [M1, M2], reglas: [regla("m1"), regla("m2")], reservas, bloqueos: [] });
    expect(h.find((x) => x.inicio === 600)?.maquinaId).toBe("m2");
  });

  it("tiene en cuenta el traslado desde otra localidad", () => {
    const reservas: Reserva[] = [
      { id: "r1", maquinaId: "m1", ubicacionId: "ondara", fecha: base.fecha, inicio: 540, fin: 630, estado: "confirmada" },
    ];
    const h = huecosDelDia({ ...base, ubicacionId: "denia", maquinas: [M1], reglas: [regla("m1")], reservas, bloqueos: [], logistica: log });
    // 10:30 fin + 60 de margen => primera sesión en Dénia a las 11:30
    expect(h.map((x) => hhmm(x.inicio))).toEqual(["11:30"]);
  });

  it("mantenimiento bloquea la máquina", () => {
    const h = huecosDelDia({
      ...base, ubicacionId: "denia", maquinas: [M1], reglas: [regla("m1")], reservas: [],
      bloqueos: [{ maquinaId: "m1", fecha: base.fecha, inicio: 540, fin: 780, motivo: "mantenimiento" }],
    });
    expect(h).toEqual([]);
  });

  it("máquina en mantenimiento o fuera de la ubicación no ofrece huecos", () => {
    const enTaller: Maquina = { ...M1, estado: "mantenimiento" };
    expect(huecosDelDia({ ...base, ubicacionId: "denia", maquinas: [enTaller], reglas: [regla("m1")], reservas: [], bloqueos: [] })).toEqual([]);
    expect(huecosDelDia({ ...base, ubicacionId: "pedreguer", maquinas: [M1], reglas: [regla("m1")], reservas: [], bloqueos: [] })).toEqual([]);
  });

  it("no ofrece horas pasadas", () => {
    const h = huecosDelDia({ ...base, ubicacionId: "denia", maquinas: [M1], reglas: [regla("m1")], reservas: [], bloqueos: [], ahora: 600 });
    expect(h[0] && hhmm(h[0].inicio)).toBe("10:30");
  });
});
