import next from "eslint-config-next";

const config = [
  ...next,
  { ignores: ["src/vendor/**", "produccion/**", ".next/**", "node_modules/**", "scrollcraft/**"] },
];

export default config;
