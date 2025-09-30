# 🚀 Configuração do Vercel Blob

## ✅ Store Criada

**Store ID:** `store_IC0IM5E82vZIZ7ec`  
**Region:** São Paulo, Brazil (GRU1)  
**Base URL:** `https://ic0im5e82vziz7ec.public.blob.vercel-storage.com`

---

## 📋 Próximos Passos

### 1. **Desenvolvimento Local**

No dashboard da Vercel Blob Store, você deve ter recebido um token. Copie e adicione ao arquivo `.env.local`:

\`\`\`bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_SEU_TOKEN_AQUI
\`\`\`

Depois reinicie o servidor de desenvolvimento:

\`\`\`bash
npm run dev
\`\`\`

### 2. **Configuração no Vercel (Produção)**

1. Acesse: https://vercel.com/seu-usuario/atelier-da-rubi/settings/environment-variables

2. Adicione a variável de ambiente:
   - **Name:** `BLOB_READ_WRITE_TOKEN`
   - **Value:** Cole o token da Blob Store
   - **Environments:** Production, Preview, Development

3. Clique em "Save"

4. Faça redeploy do projeto:
   \`\`\`bash
   git add .
   git commit -m "Configure Vercel Blob"
   git push
   \`\`\`

### 3. **Verificar Conexão**

Após configurar:

1. Acesse: `/admin/storage`
2. Você deve ver o badge verde: **✓ Conectado ao Vercel Blob**
3. Tente fazer upload de uma imagem
4. A imagem deve mostrar badge "Blob" (verde)

---

## 🔍 Onde Encontrar o Token

1. Acesse: https://vercel.com/dashboard/stores
2. Clique na sua Blob Store: `store_IC0IM5E82vZIZ7ec`
3. Na aba **".env.local"** ou **"Quickstart"**
4. Copie o valor de `BLOB_READ_WRITE_TOKEN`

O token deve começar com: `vercel_blob_rw_...`

---

## 📊 Informações Técnicas

- **Região:** GRU1 (São Paulo) - Ótima latência para Brasil
- **Armazenamento:** Ilimitado no plano Pro
- **Bandwidth:** 1TB/mês (Pro)
- **Durabilidade:** 99.999999999% (11 noves)

---

## 🧪 Testando

### Upload via código:
\`\`\`typescript
import { put } from '@vercel/blob'

const blob = await put('test.jpg', file, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN
})

console.log(blob.url)
// https://ic0im5e82vziz7ec.public.blob.vercel-storage.com/test.jpg
\`\`\`

---

## ⚠️ Importante

- **NÃO** commite o token no git
- Adicione `.env.local` ao `.gitignore`
- O token dá acesso total à sua Blob Store
- Regenere o token se ele vazar

---

## 🎯 Status Atual

- ✅ Blob Store criada (São Paulo)
- ⏳ Token pendente configuração
- ⏳ Variável de ambiente pendente
- ⏳ Teste de upload pendente

Após adicionar o token, o sistema migrará automaticamente de localStorage para Vercel Blob!
