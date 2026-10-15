// shared/constants/bff.ts — Constantes transversais do repasse BFF -> backend Java (painel).
// TEMPO_LIMITE_JAVA_MS é o teto de 30s do $fetch do BFF (MEDIUM-3): aborta e cai em erro
// recuperável em vez de pendurar a requisição. Isomórfica. Steering nomenclatura-constantes.

// Teto de tempo (ms) para toda chamada do Nitro ao backend Java.
export const TEMPO_LIMITE_JAVA_MS = 30_000
