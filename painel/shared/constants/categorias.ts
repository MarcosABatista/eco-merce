// shared/constants/categorias.ts — Fonte única das categorias fixas e rótulos pt-BR do painel.
// Usada no USelect do formulário de produto e na validação do BFF. Ordem canônica de exibição.
// Isomórfica (app + server), importável via #shared. Steering nomenclatura-constantes.

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
