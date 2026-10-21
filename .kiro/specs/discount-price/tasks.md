# Implementation Plan: Preço com Desconto

## Overview

Implementação do campo de preço com desconto (`preco_desconto`) no sistema Daqui. O plano segue a ordem: banco de dados → entidade → DTOs → service (validação + cálculo) → front-end admin → front-end vitrine. Os dois front-ends podem ser implementados em paralelo após o back-end estar completo.

## Tasks

- [x] 1. Back-end: Migration e camada de dados
  - [x] 1.1 Criar migration Flyway V3 para adicionar coluna `preco_desconto`
    - Criar arquivo `src/main/resources/db/migration/V3__add_preco_desconto_to_produtos.sql`
    - Adicionar coluna `preco_desconto NUMERIC(10,2)` nullable à tabela `produtos`
    - Adicionar constraint `ck_produtos_preco_desconto_positive CHECK (preco_desconto > 0)`
    - _Requisitos: 1.1, 1.5_

  - [x] 1.2 Adicionar campo `precoDesconto` na entidade `Produto`
    - Adicionar atributo `private BigDecimal precoDesconto` com `@Column(name = "preco_desconto", precision = 10, scale = 2)`
    - Gerar getter e setter (Lombok)
    - _Requisitos: 1.1_

- [x] 2. Back-end: DTOs e lógica de serviço
  - [x] 2.1 Atualizar DTOs de request e response
    - Adicionar campo `BigDecimal precoDesconto` em `CreateProdutoRequest` com `@DecimalMin(value = "0.01", message = "Preço com desconto deve ser maior que zero")`
    - Adicionar campo `BigDecimal precoDesconto` em `UpdateProdutoRequest` com `@DecimalMin(value = "0.01", message = "Preço com desconto deve ser maior que zero")`
    - Adicionar campos `BigDecimal precoDesconto` e `Integer percentualDesconto` em `ProdutoResponse`
    - _Requisitos: 1.2, 2.3_

  - [x] 2.2 Implementar validação e cálculo no `ProdutoService`
    - Criar método `validarPrecoDesconto(BigDecimal preco, BigDecimal precoDesconto)` que lança `BusinessException` se `precoDesconto >= preco`
    - Criar método `calcularPercentualDesconto(BigDecimal preco, BigDecimal precoDesconto)` que retorna `Integer` (arredondado, range 1-99) ou `null`
    - Chamar validação nos métodos `create` e `update`
    - Atualizar método `toResponse` para incluir `precoDesconto` e `percentualDesconto`
    - Tratar envio de `precoDesconto` como `null` no update (limpar desconto)
    - _Requisitos: 1.2, 1.3, 1.4, 2.1, 2.2, 2.4_

  - [ ]* 2.3 Escrever property test para validação de preço com desconto
    - **Property 1: Validação de preço com desconto**
    - Gerar pares aleatórios (preco, precoDesconto) e verificar que a validação aceita se e somente se `0 < precoDesconto < preco`
    - Usar jqwik com mínimo 100 iterações
    - **Valida: Requisitos 1.2, 1.3**

  - [ ]* 2.4 Escrever property test para cálculo do percentual de desconto
    - **Property 2: Cálculo do percentual de desconto**
    - Gerar pares válidos (preco, precoDesconto) onde `0 < precoDesconto < preco` e verificar que `percentualDesconto == round((preco - precoDesconto) / preco * 100)` e está em [1, 99]
    - Usar jqwik com mínimo 100 iterações
    - **Valida: Requisitos 2.1, 2.4**

  - [ ]* 2.5 Escrever testes unitários para `ProdutoService` (cenários de desconto)
    - Testar criação com precoDesconto válido → persiste e calcula percentual
    - Testar criação com precoDesconto >= preco → lança BusinessException
    - Testar criação sem precoDesconto → percentualDesconto é null
    - Testar update com precoDesconto null → limpa desconto
    - _Requisitos: 1.2, 1.3, 1.4, 2.1, 2.2_

- [x] 3. Checkpoint - Back-end completo
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Front-end Admin: Tipos, formulários e listagem
  - [x] 4.1 Atualizar interfaces TypeScript no `produtoService.ts`
    - Adicionar `precoDesconto: number | null` e `percentualDesconto: number | null` na interface `Produto`
    - Adicionar `precoDesconto?: number | null` em `CreateProdutoRequest`
    - Adicionar `precoDesconto?: number | null` em `UpdateProdutoRequest`
    - _Requisitos: 7.1, 7.2_

  - [x] 4.2 Adicionar campo "Preço com desconto" nos formulários de criação e edição
    - Adicionar input numérico opcional "Preço com desconto" em `CreateProdutoView.vue`
    - Adicionar input numérico opcional "Preço com desconto" em `EditProdutoView.vue`
    - Implementar validação client-side: se preenchido, deve ser menor que o preço original
    - Se vazio, enviar `null` na requisição
    - Exibir mensagem de erro do back-end quando retornado
    - _Requisitos: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.3 Exibir preço com desconto na listagem (`HomeView.vue`)
    - Se `precoDesconto` preenchido: exibir preço original com `text-decoration: line-through` e preço com desconto em destaque
    - Se `precoDesconto` null: exibir apenas preço original normalmente
    - _Requisitos: 4.1, 4.2_

  - [ ]* 4.4 Escrever property test para validação front-end do preço com desconto
    - **Property 3: Validação front-end do preço com desconto**
    - Extrair função de validação e testar com fast-check: gerar pares (preco, precoDesconto) e verificar que rejeita se e somente se `precoDesconto >= preco`
    - Usar fast-check com mínimo 100 iterações
    - **Valida: Requisitos 3.2**

  - [ ]* 4.5 Escrever testes unitários para componentes admin (cenários de desconto)
    - Testar HomeView: renderização com e sem desconto (preço riscado vs normal)
    - Testar CreateProdutoView: validação do campo precoDesconto, envio de null quando vazio
    - Testar EditProdutoView: preenchimento do campo com valor existente, validação
    - _Requisitos: 3.1, 3.2, 3.3, 4.1, 4.2_

- [x] 5. Front-end Vitrine: Tipos e exibição de desconto
  - [x] 5.1 Atualizar interface `Produto` em `vitrine/src/types/produto.ts`
    - Adicionar `precoDesconto: number | null` e `percentualDesconto: number | null`
    - _Requisitos: 7.3_

  - [x] 5.2 Implementar exibição de desconto no `ProductCard.vue`
    - Se `precoDesconto` preenchido: preço original riscado + preço desconto em destaque + badge "-X%"
    - Se `precoDesconto` null: apenas preço original
    - Estilizar badge de desconto com destaque visual
    - _Requisitos: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.3 Implementar exibição de desconto no `ProductDetailView.vue`
    - Se `precoDesconto` preenchido: preço original riscado + preço desconto em destaque + badge "-X%"
    - Se `precoDesconto` null: apenas preço original
    - Adaptar layout de detalhe para acomodar os novos elementos
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.4 Escrever testes unitários para componentes vitrine (cenários de desconto)
    - Testar ProductCard: renderização com desconto (preço riscado, badge "-X%"), sem desconto (apenas preço normal)
    - Testar ProductDetailView: mesmos cenários adaptados ao layout de detalhe
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_

- [x] 6. Checkpoint final - Todos os testes passam
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser ignoradas para um MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Property tests validam propriedades universais de corretude (jqwik no back-end, fast-check no front-end)
- Testes unitários validam exemplos específicos e edge cases
- A migration é V3 pois já existem V1 (usuarios) e V2 (produtos)
- Os front-ends admin e vitrine podem ser implementados em paralelo após o checkpoint do back-end

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2"] },
    { "id": 4, "tasks": ["2.3", "2.4", "2.5"] },
    { "id": 5, "tasks": ["4.1", "5.1"] },
    { "id": 6, "tasks": ["4.2", "4.3", "5.2", "5.3"] },
    { "id": 7, "tasks": ["4.4", "4.5", "5.4"] }
  ]
}
```
