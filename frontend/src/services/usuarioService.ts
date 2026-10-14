import api from './api'

export interface Usuario {
  id: number
  cpfCnpj: string
  nome: string
  email: string
  telefone: string | null
  nomeLoja: string | null
  ativo: boolean
  admin: boolean
  imagemLoja: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateUsuarioRequest {
  cpfCnpj?: string
  nome?: string
  email?: string
  telefone?: string
  senha?: string
  nomeLoja?: string
  imagemLoja?: string
}

export interface CreateUsuarioRequest {
  cpfCnpj: string
  nome: string
  email: string
  telefone?: string
  senha: string
  nomeLoja?: string
  imagemLoja?: string
  ativo?: boolean
  admin?: boolean
}

export const usuarioService = {
  async getById(id: number): Promise<Usuario> {
    const { data } = await api.get(`/usuarios/${id}`)
    return data
  },

  async create(request: CreateUsuarioRequest): Promise<Usuario> {
    const { data } = await api.post('/usuarios', request)
    return data
  },

  async update(id: number, request: UpdateUsuarioRequest): Promise<Usuario> {
    const { data } = await api.put(`/usuarios/${id}`, request)
    return data
  },
}
