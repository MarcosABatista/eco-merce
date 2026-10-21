// shared/constants/vitrine.ts — Textos e limites de UI da vitrine usados em mais de um componente.
// Marca, título do banner (<=60, truncado pelo helper), mensagens de estado (vazio/erro) e rótulo
// de a11y do placeholder de imagem. Fonte única para evitar literais duplicados entre componentes
// e páginas e permitir que os testes asseram contra constantes (steering testing §3/nomenclatura).

// Marca exibida no cabeçalho fixo (RF-VIT-1).
export const VITRINE_MARCA = 'Daqui'

// Placeholder da barra de busca (busca por nome do produto OU da loja).
export const VITRINE_BUSCA_PLACEHOLDER = 'Buscar produtos ou lojas'
export const VITRINE_BUSCA_ARIA = 'Buscar produtos ou lojas'

// Banner promocional (RF-VIT-2): título <= 60 chars (o helper trunca com reticência se exceder).
export const VITRINE_BANNER_TITULO = 'Ofertas imperdíveis todos os dias'
export const VITRINE_BANNER_SUBTITULO = 'Os melhores preços das suas lojas favoritas'
export const VITRINE_BANNER_TITULO_MAX = 60
export const VITRINE_BANNER_SELO = 'Direto com a loja'

// Seções da home.
export const VITRINE_TITULO_CATEGORIAS = 'Categorias'
export const VITRINE_TITULO_OFERTAS = 'Ofertas do Dia'
export const VITRINE_CATEGORIA_TODAS = 'Todas'

// Mensagens de estado (RF-VIT-4): vazio de catálogo vs vazio de busca vs erro.
export const VITRINE_MSG_SEM_PRODUTOS = 'Nenhum produto encontrado'
export const VITRINE_MSG_BUSCA_VAZIA = 'Nenhum produto encontrado para a sua busca'
export const VITRINE_MSG_BUSCA_VAZIA_DICA = 'Carregue mais produtos para ampliar a busca.'
export const VITRINE_MSG_ERRO_GRADE = 'Serviço temporariamente indisponível'
export const VITRINE_MSG_ERRO_DETALHE = 'Não foi possível carregar o produto'
export const VITRINE_MSG_PRODUTO_NAO_ENCONTRADO = 'Produto não encontrado'
export const VITRINE_ACAO_TENTAR_NOVAMENTE = 'Tentar novamente'

// a11y do placeholder de imagem (NIT-1 / product-detail Req 7.5).
export const VITRINE_IMAGEM_INDISPONIVEL = 'Imagem indisponível'

// Ícone lucide por categoria (Categorias — RF-VIT-3).
export const VITRINE_ICONES_CATEGORIA: Record<string, string> = {
  VESTUARIO: 'i-lucide-shirt',
  ELETRODOMESTICOS: 'i-lucide-washing-machine',
  ACESSORIOS: 'i-lucide-watch',
  SUPLEMENTOS: 'i-lucide-pill',
}

// Classes utilitárias de cor por categoria para os cards circulares (estilo marketplace).
// Cada entrada define o fundo e a cor do ícone do círculo quando não selecionado. As cores são
// decorativas; o estado selecionado usa a cor primária do design system (ver o componente).
export const VITRINE_CORES_CATEGORIA: Record<string, string> = {
  VESTUARIO: 'bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400',
  ELETRODOMESTICOS: 'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
  ACESSORIOS: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  SUPLEMENTOS: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
}
