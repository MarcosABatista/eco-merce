export interface Produto {
  id: number
  nome: string
  descricao: string | null
  preco: number
  precoDesconto: number | null
  percentualDesconto: number | null
  categoria: Categoria
  urlImagem: string | null
  ativo: boolean
  nomeLoja: string | null
  telefone: string | null
  createdAt: string
  updatedAt: string
}

export type Categoria = 'VESTUARIO' | 'ELETRODOMESTICOS' | 'ACESSORIOS' | 'SUPLEMENTOS'
