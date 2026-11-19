import { describe, expect, it } from "vitest";
import { AJUSTES } from "./ajustes";
import { disponibilidadPublica } from "./consulta";
import { repositorioPrototipo, type RepositorioReservas } from "./repositorio";

describe("disponibilidadPublica", () => {
  const ahora = new Date("2026-11-14T09:43:00Z"); // sábado 10:43 en Madrid

  it("devuelve los días de la ventana con sus horas", async () => {
    const d = await disponibilidadPublica(repositorioPrototipo, "denia", ahora, { ...AJUSTES, antelacionMinima: 720, diasVista: 14 });
    expect(d.prototipo).toBe(true);
    expect(d.dias).toHaveLength(14);
    expect(d.dias[0]).toMatchObject({ fecha: "2026-11-14", horas: [] }); // hoy ya no da tiempo
    expect(d.dias[1].horas[0]).toEqual({ inicio: "08:00", fin: "09:30" });
    expect(d.dias[1].horas.at(-1)).toEqual({ inicio: "20:30", fin: "22:00" });
  });

  it("no expone máquinas ni repartidores", async () => {
    const repo: RepositorioReservas = {
      prototipo: false,
      async datosDia(fecha) {
        const base = await repositorioPrototipo.datosDia(fecha);
        return {
          ...base,
          reservas: [{ id: "r1", maquinaId: "hp-1", repartidorId: "xavi", localidadId: "ondara", fecha, inicio: 600, fin: 690, estado: "confirmada" }],
        };
      },
    };
    const d = await disponibilidadPublica(repo, "denia", ahora);
    const texto = JSON.stringify(d);
    expect(texto).not.toMatch(/hp-1|xavi|marc|r1/);
  });
});
