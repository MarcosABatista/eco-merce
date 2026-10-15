// server/api/upload/[userId].post.ts — Upload de imagem do lojista (BFF multipart).
// Exige sessão, CSRF (_token no multipart) e autorização dono-ou-admin (anti-IDOR). Valida o
// arquivo por MAGIC NUMBER (não pelo Content-Type do cliente) e repassa ao Java com o campo
// nomeado EXATAMENTE "file" e filename sintético derivado do magic (imagem.jpg/.png) — design §7.4.

export default defineEventHandler(async (event) => {
  const sessao = await exigirSessao(event)
  const userId = validarIdInteiro(getRouterParam(event, 'userId'))
  const { encryptionKey } = useRuntimeConfig(event)

  const partes = await readMultipartFormData(event)
  if (!partes || partes.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })
  }

  // CSRF: o _token vem como campo do multipart.
  const campoToken = partes.find(p => p.name === '_token' && !p.filename)
  const token = campoToken?.data?.toString('utf8')
  if (!validarTokenCsrf(token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  // Autorização: só o próprio usuário (ou admin) envia imagem para o seu diretório.
  exigirDonoOuAdmin(sessao, userId)

  // Arquivo: campo "file". Validação por magic number (ignora o Content-Type do cliente).
  const arquivo = partes.find(p => p.name === 'file' && p.filename)
  if (!arquivo?.data || arquivo.data.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo ausente' })
  }
  const { tipo, filename } = validarImagemUpload(new Uint8Array(arquivo.data))

  // Repasse ao Java: FormData com o campo "file" (nome exigido pelo @RequestParam) e filename
  // sintético derivado do magic, para o objectName terminar em .jpg/.png (regex do proxy §7.3).
  const corpo = new FormData()
  corpo.append('file', new Blob([new Uint8Array(arquivo.data)], { type: tipo }), filename)

  return chamarJava<{ url: string }>(event, `/upload/${userId}`, { method: 'POST', body: corpo })
})

// curl:
//   # Upload de imagem (cookie de sessão + _token CSRF; só o próprio userId ou admin):
//   curl -s -b cookies.txt -X POST 'http://localhost:3000/api/upload/7' \
//     -F 'file=@/caminho/para/foto.jpg' -F '_token=<timestamp.hmac>'
//   # Respostas: 200 { url: "/api/v1/images/{objectName}" }  (repassado do Java)
//   #            400 { statusMessage: "Assinatura do arquivo inválida" }  (não é JPEG/PNG real)
//   #            400 { statusMessage: "Arquivo ausente" | "Dados inválidos" }
//   #            401 { statusMessage: "Não autenticado" }
//   #            403 { statusMessage: "Acesso negado" }  (CSRF inválido OU userId de outro usuário)
