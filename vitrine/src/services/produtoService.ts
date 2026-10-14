import api from './api'
import type { Produto } from '@/types/produto'
import type { PageResponse } from '@/types/api'

export const produtoService = {
  async findAll(page = 0, size = 20, categoria?: string): Promise<PageResponse<Produto>> {
    const params: Record<string, unknown> = { page, size }
    if (categoria) params.categoria = categoria
    const { data } = await api.get<PageResponse<Produto>>('/produtos', { params })
    return data
  },

  async findById(id: number): Promise<Produto> {
    const { data } = await api.get<Produto>(`/produtos/${id}`)
    return data
  },
}
