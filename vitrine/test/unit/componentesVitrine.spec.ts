// test/unit/componentesVitrine.spec.ts — Análise estática do markup dos componentes da vitrine.
// Verifica a INTENÇÃO de design dos SFCs (RF-VIT-5/9 + §9) sem montar no runtime Nuxt — o ambiente
// nuxt do @nuxt/test-utils 4.3.3 não roda sob Vite 8 (strict exports em nuxt/dist/app). Fallback
// sancionado pelo steering de testing (item 4/6): readFileSync do .vue + asserção da estrutura.
// A invariante lógica do WhatsApp já é coberta por whatsapp.spec.ts (property tests).

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { rotuloCategoria } from '../../shared/constants/categorias'
import { WHATSAPP_COR_MARCA } from '../../shared/constants/whatsapp'

// Lê um componente da vitrine como texto (relativo a este arquivo de teste).
function lerComponente(nome: string): string {
  return readFileSync(
    fileURLToPath(new URL(`../../app/components/vitrine/${nome}`, import.meta.url)),
    'utf8',
  )
}

describe('CartaoProduto.vue — categoria + bloco de desconto (RF-VIT-5)', () => {
  const fonte = lerComponente('CartaoProduto.vue')

  it('exibe a categoria como UBadge pt-BR via rotuloCategoria', () => {
    expect(fonte).toContain('rotuloCategoria(props.produto.categoria)')
    expect(fonte).toMatch(/<UBadge[^>]*color="neutral"[^>]*variant="subtle"/)
    // Rótulo pt-BR vem da fonte única CATEGORIAS (steering testing §3).
    expect(rotuloCategoria('VESTUARIO')).toBe('Vestuário')
  })

  it('renderiza bloco de desconto condicional (riscado + preço com desconto + -X%)', () => {
    // Preço original riscado quando há precoDesconto.
    expect(fonte).toContain('cartao-preco-original')
    expect(fonte).toContain('line-through')
    // Preço com desconto em destaque (primary).
    expect(fonte).toContain('cartao-preco-desconto')
    expect(fonte).toContain('text-primary')
    // Badge de desconto -X% com cor semântica error e percentual do backend.
    expect(fonte).toMatch(/<UBadge[^>]*color="error"/)
    expect(fonte).toContain('percentualDesconto')
    // Preço simples (sem desconto) tem data-testid próprio e é mutuamente exclusivo (v-else).
    expect(fonte).toContain('cartao-preco')
    expect(fonte).toMatch(/v-if="props\.produto\.precoDesconto != null"[\s\S]*v-else/)
  })

  it('oculta o nome da loja quando nulo (v-if sobre nomeLoja)', () => {
    expect(fonte).toMatch(/v-if="props\.produto\.nomeLoja"/)
  })

  it('placeholder de imagem é acessível (role img + aria-label)', () => {
    expect(fonte).toContain('role="img"')
    expect(fonte).toContain(':aria-label="VITRINE_IMAGEM_INDISPONIVEL"')
  })
})

describe('BotaoWhatsapp.vue — oculto quando inválido + wa.me (RF-VIT-9)', () => {
  const fonte = lerComponente('BotaoWhatsapp.vue')

  it('o elemento só é renderizado quando a URL existe (v-if sobre url)', () => {
    // v-if="url" garante que telefone inválido (url null) não renderiza nada no DOM.
    expect(fonte).toMatch(/v-if="url"/)
    expect(fonte).toContain('montarUrlWhatsapp(props.telefone, props.nomeProduto)')
  })

  it('usa a cor da marca WhatsApp (#25D366) — única hex autorizada', () => {
    expect(fonte).toContain('WHATSAPP_COR_MARCA')
    expect(WHATSAPP_COR_MARCA).toBe('#25D366')
  })

  it('stopPropagation para não navegar ao detalhe dentro do card', () => {
    expect(fonte).toContain('@click.stop')
  })
})

describe('home / grade — erro não-fatal da grade (§9/MEDIUM-6)', () => {
  const home = readFileSync(
    fileURLToPath(new URL('../../app/pages/index.vue', import.meta.url)),
    'utf8',
  )

  it('captura error do useFetch sem throw/createError (não cai em error.vue)', () => {
    // Remove o bloco de comentário de cabeçalho (que cita "throw/createError" em prosa) antes de
    // asserir que não há chamada real de createError nem throw no código da página.
    const codigo = home.replace(/<!--[\s\S]*?-->/g, '')
    expect(codigo).toContain('const { data, status, error, refresh }')
    expect(codigo).not.toContain('createError(')
    expect(codigo).not.toMatch(/\bthrow\b/)
  })

  it('EstadoErro é inline no slot da grade; banner e categorias ficam fora do ramo da grade', () => {
    // Banner e categorias são irmãos da seção de ofertas (não dentro do ramo condicional da grade).
    const posBanner = home.indexOf('<BannerPromocional')
    const posCategorias = home.indexOf('<CategoriasPopulares')
    const posSecaoOfertas = home.indexOf('secao-ofertas')
    expect(posBanner).toBeGreaterThanOrEqual(0)
    expect(posCategorias).toBeGreaterThanOrEqual(0)
    // Banner e categorias aparecem ANTES da seção de ofertas (irmãos, não derrubados pelo erro).
    expect(posBanner).toBeLessThan(posSecaoOfertas)
    expect(posCategorias).toBeLessThan(posSecaoOfertas)
    // EstadoErro é renderizado no lugar da grade quando há erro.
    expect(home).toMatch(/<EstadoErro[\s\S]*v-else-if="temErro"|v-else-if="temErro"[\s\S]*EstadoErro/)
  })
})
