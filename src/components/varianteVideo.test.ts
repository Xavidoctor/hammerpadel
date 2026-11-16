import { describe, expect, it } from "vitest";
import { varianteVideo } from "./ScrollCraftStage";

describe("varianteVideo: vídeo según la forma de la ventana", () => {
  it("ventana vertical: vídeo de móvil", () => {
    expect(varianteVideo(390, 844, 3)).toBe("m");
  });
  it("portátil con escala de Windows al 150 %: horizontal, nunca el de móvil", () => {
    expect(varianteVideo(853, 400, 1.5)).not.toBe("m");
    expect(varianteVideo(1280, 595, 1.5)).toBe("uwhd");
  });
  it("Full HD con la barra del navegador: ultrapanorámica 2560", () => {
    expect(varianteVideo(1903, 940, 1)).toBe("uwhd");
  });
  it("16:9 y 16:10: 1920 por defecto, 2560 en pantallas grandes o de alta densidad", () => {
    expect(varianteVideo(1920, 1080, 1)).toBe("hd");
    expect(varianteVideo(1440, 900, 1)).toBe("hd");
    expect(varianteVideo(1440, 900, 2)).toBe("2k");
    expect(varianteVideo(2560, 1440, 1)).toBe("2k");
  });
  it("ultrapanorámica grande: 3440", () => {
    expect(varianteVideo(3440, 1440, 1)).toBe("uw");
  });
});
