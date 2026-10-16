// shared/types/usuario.ts — Tipos isomórficos do domínio Usuário (lojista) do painel.
// Usuario espelha o UsuarioResponse real do backend (SEM senha). SessaoUsuario é o subconjunto
// guardado no cookie de sessão httpOnly (nunca a senha). IDs number (steering tipos-numericos).

// Usuário como devolvido pela API (UsuarioResponse) — nunca inclui a senha.
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

// Payload mínimo persistido na sessão (cookie httpOnly server-side). Base das decisões de
// autorização anti-IDOR do BFF (dono = sessao.id; admin = sessao.admin).
export interface SessaoUsuario {
  id: number
  nome: string
  email: string
  nomeLoja: string | null
  admin: boolean
  ativo: boolean
  imagemLoja: string | null
}

// Valores validados emitidos pelo FormularioUsuario (criação; sem o _token CSRF, que a página
// injeta no $fetch). Fica aqui (e não no <script setup>, que não permite `export`) para ser
// importável pelo componente e pela página.
export interface ValoresUsuario {
  cpfCnpj: string
  nome: string
  email: string
  telefone: string | null
  nomeLoja: string | null
  senha: string
  ativo: boolean
  admin: boolean
}

// Valores validados emitidos pelo FormularioPerfil (edição parcial; senha em branco é omitida
// para o BFF manter a atual). Mesmo motivo de localização que ValoresUsuario.
export interface ValoresPerfil {
  nome: string
  email: string
  telefone: string | null
  nomeLoja: string | null
  senha?: string
  imagemLoja: string | null
}
