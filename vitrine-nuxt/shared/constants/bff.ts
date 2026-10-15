// shared/constants/bff.ts — Constantes transversais do repasse BFF -> backend Java (vitrine).
// TEMPO_LIMITE_JAVA_MS é o teto de 30s do $fetch do BFF (RF/MEDIUM-3): evita skeleton infinito,
// aborta e cai em erro recuperável. Isomórfica (app + server). Steering nomenclatura-constantes.

// Teto de tempo (ms) para toda chamada do Nitro ao backend Java (grade e detalhe).
export const TEMPO_LIMITE_JAVA_MS = 30_000
