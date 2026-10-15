// shared/constants/categorias.ts — Fonte única das categorias fixas e rótulos pt-BR da vitrine.
// Usada nas Categorias Populares da home e na validação de query do BFF. Ordem canônica de
// exibição. Isomórfica (app + server), importável via #shared. Steering nomenclatura-constantes.

import type { Categoria } from '../types/produto'

// Ordem de exibição + rótulo pt-BR por categoria. CATEGORIAS é o prefixo de contexto.
export const CATEGORIAS: ReadonlyArray<{ valor: Categoria, rotulo: string }> = [
  { valor: 'VESTUARIO', rotulo: 'Vestuário' },
  { valor: 'ELETRODOMESTICOS', rotulo: 'Eletrodomésticos' },
  { valor: 'ACESSORIOS', rotulo: 'Acessórios' },
  { valor: 'SUPLEMENTOS', rotulo: 'Suplementos' },
] as const

// Lista só dos valores aceitos (whitelist do enum), derivada de CATEGORIAS.
export const CATEGORIAS_VALORES: ReadonlyArray<Categoria> = CATEGORIAS.map(c => c.valor)

// Rótulo pt-BR de uma categoria (fallback para o próprio valor se desconhecida). Fonte única
// usada no card, no detalhe e na trilha de navegação da vitrine.
export function rotuloCategoria(valor: Categoria | string | null | undefined): string {
  return CATEGORIAS.find(c => c.valor === valor)?.rotulo ?? String(valor ?? '')
}
