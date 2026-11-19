import { describe, expect, it } from "vitest";
import { AJUSTES, MAQUINAS, REPARTIDORES, type Ajustes } from "./ajustes";
import {
  agendaViable,
  comprobarHora,
  fechaReservable,
  fechasReservables,
  horasLibres,
  minInicioDelDia,
  type DatosDia,
} from "./disponibilidad";
import { hhmm } from "./tiempo";
import type { ReservaDia } from "./tipos";

// Ajustes fijos para las pruebas (no dependen de los valores propuestos).
const aj: Ajustes = {
  ...AJUSTES,
  primeraHora: 480,
  ultimaHora: 1230,
  paso: 30,
  duracion: 90,
  montaje: 15,
  recogida: 15,
  trasladoMismaLocalidad: 10,
  trasladoEntreLocalidades: 20,
  modo: "deja_y_vuelve",
  modoPorLocalidad: {},
};
const FECHA = "2026-11-19";
const h = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const XAVI = [REPARTIDORES[0]];

const reserva = (p: Partial<ReservaDia> & { inicio: number }): ReservaDia => ({
  id: `r-${p.inicio}-${p.localidadId ?? "denia"}-${p.repartidorId ?? "xavi"}`,
  maquinaId: "hp-1",
  repartidorId: "xavi",
  localidadId: "denia",
  fecha: FECHA,
  fin: p.inicio + 90,
  estado: "confirmada",
  ...p,
});

const dia = (d: Partial<DatosDia> = {}): DatosDia => ({
  fecha: FECHA,
  maquinas: MAQUINAS,
  repartidores: REPARTIDORES,
  reservas: [],
  bloqueos: [],
  ...d,
});

const libres = (d: DatosDia, localidadId: string, minInicio = -Infinity, a = aj) =>
  horasLibres(a, d, { localidadId, minInicio }).map((x) => hhmm(x.inicio));

const probar = (d: DatosDia, localidadId: string, t: string, a = aj) =>
  comprobarHora(a, d, { localidadId, inicio: h(t), minInicio: -Infinity });

describe("horario", () => {
  it("un día libre ofrece de 8:00 a 20:30 cada 30 min", () => {
    const l = libres(dia(), "denia");
    expect(l[0]).toBe("08:00");
    expect(l.at(-1)).toBe("20:30");
    expect(l).toHaveLength(26);
  });

  it("rechaza horas fuera del horario o fuera de la rejilla", () => {
    for (const t of ["07:30", "20:45", "21:00", "08:15"]) {
      expect(probar(dia(), "denia", t)).toEqual({ ok: false, motivo: "fuera_de_horario" });
    }
  });

  it("respeta la antelación mínima", () => {
    expect(libres(dia(), "denia", h("10:01"))[0]).toBe("10:30");
    expect(libres(dia(), "denia", Infinity)).toEqual([]);
  });

  it("la sesión dura 90 minutos", () => {
    const r = probar(dia(), "denia", "18:00");
    expect(r.ok && hhmm(r.fin)).toBe("19:30");
  });
});

describe("un solo repartidor (ejemplos del documento)", () => {
  const d = dia({ repartidores: XAVI, reservas: [reserva({ inicio: h("10:00") })] });

  it("no puede montar en dos sitios a la vez", () => {
    expect(probar(d, "pedreguer", "10:00")).toEqual({ ok: false, motivo: "sin_repartidor" });
  });
  it("tiene en cuenta el trayecto entre pueblos", () => {
    expect(probar(d, "pedreguer", "10:30").ok).toBe(false);
    expect(probar(d, "pedreguer", "11:00").ok).toBe(true);
  });
  it("no puede recoger y montar a la vez en el mismo pueblo", () => {
    expect(probar(d, "denia", "11:30").ok).toBe(false);
    expect(probar(d, "denia", "12:00").ok).toBe(false);
    expect(probar(d, "denia", "12:30").ok).toBe(true);
  });
  it("encaja sesiones antes de otra si llega a tiempo", () => {
    const d2 = dia({ repartidores: XAVI, reservas: [reserva({ inicio: h("10:30") })] });
    // Recoge en Ondara a las 9:30–9:45 y monta en Dénia a las 10:15: le sobra tiempo.
    expect(probar(d2, "ondara", "08:00").ok).toBe(true);
    // Recogería en Ondara a las 10:00–10:15: no llega a montar en Dénia a las 10:15.
    expect(probar(d2, "ondara", "08:30").ok).toBe(false);
  });
});

describe("dos repartidores", () => {
  it("si uno está ocupado, asigna la sesión al otro", () => {
    const d = dia({ reservas: [reserva({ inicio: h("10:00") })] });
    const r = probar(d, "pedreguer", "10:00");
    expect(r).toMatchObject({ ok: true, repartidorId: "marc" });
  });

  it("como mucho dos entregas a la misma hora", () => {
    const d = dia({
      reservas: [
        reserva({ inicio: h("10:00"), maquinaId: "hp-1", repartidorId: "xavi" }),
        reserva({ inicio: h("10:00"), maquinaId: "hp-2", repartidorId: "marc", localidadId: "ondara" }),
      ],
    });
    expect(probar(d, "la-xara", "10:00")).toEqual({ ok: false, motivo: "sin_repartidor" });
  });

  it("el día libre de un repartidor deja solo al otro", () => {
    const d = dia({
      reservas: [reserva({ inicio: h("10:00") })],
      bloqueos: [{ repartidorId: "marc", fecha: FECHA, inicio: 0, fin: 1440, motivo: "manual" }],
    });
    expect(probar(d, "pedreguer", "10:00")).toEqual({ ok: false, motivo: "sin_repartidor" });
  });
});

describe("máquinas", () => {
  it("una máquina no puede tener dos ciclos solapados", () => {
    const d = dia({ maquinas: [MAQUINAS[0]], reservas: [reserva({ inicio: h("10:00") })] });
    // Otra pista: el repartidor libre (Marc) podría, pero no queda máquina.
    expect(probar(d, "ondara", "11:30")).toEqual({ ok: false, motivo: "sin_maquina" });
  });

  it("asigna otra máquina libre", () => {
    const d = dia({ reservas: [reserva({ inicio: h("10:00") })] });
    expect(probar(d, "ondara", "10:00")).toMatchObject({ ok: true, maquinaId: "hp-2" });
  });

  it("las máquinas en mantenimiento o bloqueadas no cuentan", () => {
    const d = dia({
      maquinas: [{ id: "hp-1", estado: "mantenimiento" }, { id: "hp-2", estado: "activa" }],
      bloqueos: [{ maquinaId: "hp-2", fecha: FECHA, inicio: h("09:00"), fin: h("12:00"), motivo: "mantenimiento" }],
    });
    expect(probar(d, "denia", "10:00")).toEqual({ ok: false, motivo: "sin_maquina" });
    expect(probar(d, "denia", "13:00").ok).toBe(true);
  });
});

describe("estados y bloqueos", () => {
  it("las reservas canceladas o de otro día no ocupan", () => {
    const d = dia({
      repartidores: XAVI,
      reservas: [
        reserva({ inicio: h("10:00"), estado: "cancelada" }),
        reserva({ inicio: h("10:00"), fecha: "2026-11-20" }),
      ],
    });
    expect(libres(d, "pedreguer")).toHaveLength(26);
  });

  it("un bloqueo general (festivo) cierra las horas afectadas", () => {
    const d = dia({ bloqueos: [{ fecha: FECHA, inicio: h("14:00"), fin: h("24:00"), motivo: "festivo" }] });
    const l = libres(d, "denia");
    expect(l.at(-1)).toBe("12:00"); // 12:00–13:30 + recogida hasta 13:45
    expect(probar(d, "denia", "13:00")).toEqual({ ok: false, motivo: "bloqueado" });
  });
});

describe("modo «se queda»", () => {
  it("el repartidor queda ocupado toda la sesión", () => {
    const a: Ajustes = { ...aj, modo: "se_queda" };
    const d = dia({ repartidores: XAVI, reservas: [reserva({ inicio: h("10:00") })] });
    expect(probar(d, "denia", "11:00", a).ok).toBe(false);
    expect(probar(d, "denia", "12:00", a).ok).toBe(false); // 11:45 + 10 > 11:45
    expect(probar(d, "denia", "12:30", a).ok).toBe(true);
  });
});

describe("modo por localidad (datos de Xavi)", () => {
  const real: Ajustes = { ...aj, montaje: 3, recogida: 3, modoPorLocalidad: { ondara: "se_queda", pedreguer: "se_queda" } };
  it("en Ondara el repartidor se queda: no puede hacer otra entrega durante la sesión", () => {
    const d = dia({ repartidores: XAVI, reservas: [reserva({ inicio: h("10:00"), localidadId: "ondara" })] });
    expect(probar(d, "denia", "10:30", real).ok).toBe(false);
    // Termina 11:30 + 3 de recogida + 20 de trayecto = 11:53; montaje a las 11:57.
    expect(probar(d, "denia", "12:00", real).ok).toBe(true);
  });
  it("en Dénia deja la máquina y puede atender otra sesión mientras", () => {
    const d = dia({ repartidores: XAVI, reservas: [reserva({ inicio: h("10:00"), localidadId: "denia" })] });
    expect(probar(d, "la-xara", "10:30", real).ok).toBe(true);
  });
});

describe("agendaViable", () => {
  it("no valida de nuevo pares de tareas ya existentes", () => {
    const t = (inicio: number, localidadId = "denia") => ({ reservaId: "x", tipo: "entrega" as const, localidadId, inicio, fin: inicio + 15 });
    // Dos tareas existentes que ya chocan (alta manual) no impiden una tarea lejana.
    expect(agendaViable(aj, [t(600), t(605)], [t(900)])).toBe(true);
    expect(agendaViable(aj, [t(600)], [t(620, "ondara")])).toBe(false);
  });
});

describe("fechas (hora de Madrid)", () => {
  it("antelación de 12 h: hoy ya no, mañana sin límite", () => {
    const ahora = new Date("2026-11-14T09:43:00Z"); // 10:43 en Madrid
    const a = { ...aj, antelacionMinima: 720 };
    expect(minInicioDelDia(a, "2026-11-14", ahora)).toBe(22 * 60 + 43);
    expect(minInicioDelDia(a, "2026-11-15", ahora)).toBe(-Infinity);
    expect(minInicioDelDia(a, "2026-11-13", ahora)).toBe(Infinity);
  });

  it("de madrugada la antelación alcanza al mismo día", () => {
    const ahora = new Date("2026-11-14T23:30:00Z"); // 00:30 del 15 en Madrid
    expect(minInicioDelDia({ ...aj, antelacionMinima: 720 }, "2026-11-15", ahora)).toBe(12 * 60 + 30);
  });

  it("usa la hora de verano", () => {
    const ahora = new Date("2026-07-01T06:00:00Z"); // 08:00 en Madrid (UTC+2)
    expect(minInicioDelDia({ ...aj, antelacionMinima: 60 }, "2026-07-01", ahora)).toBe(9 * 60);
  });

  it("muestra 14 días desde el día de Madrid", () => {
    const ahora = new Date("2026-11-14T23:30:00Z");
    const f = fechasReservables({ ...aj, diasVista: 14 }, ahora);
    expect(f[0]).toEqual({ fecha: "2026-11-15", diaSemana: 0 });
    expect(f).toHaveLength(14);
    expect(fechaReservable({ ...aj, diasVista: 14 }, "2026-11-28", ahora)).toBe(true);
    expect(fechaReservable({ ...aj, diasVista: 14 }, "2026-11-29", ahora)).toBe(false);
    expect(fechaReservable({ ...aj, diasVista: 14 }, "2026-11-14", ahora)).toBe(false);
  });
});
