# 🔐 Configuração do Sistema de Autenticação

Este guia explica como configurar o sistema de autenticação completo do Atelier da Rubi.

## 📋 Pré-requisitos

1. Conta no Supabase com projeto criado
2. Conta no Google Cloud Console (para login com Google)
3. Variáveis de ambiente configuradas

---

## 1️⃣ Executar Migração SQL no Supabase

Acesse o **SQL Editor** no Supabase Dashboard e execute o conteúdo do arquivo:
`supabase/migrations/add_user_auth_tables.sql`

Isso criará:
- Tabela `user_profiles` (perfil do usuário)
- Tabela `user_addresses` (endereços salvos)
- Políticas de Row Level Security (RLS)
- Triggers automáticos

---

## 2️⃣ Configurar Login com Google

### No Google Cloud Console:

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services > Credentials**
4. Clique em **Create Credentials > OAuth 2.0 Client IDs**
5. Configure:
   - **Application type**: Web application
   - **Name**: Atelier da Rubi
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**: 
     - `https://[SEU-PROJETO].supabase.co/auth/v1/callback`
6. Copie o **Client ID** e **Client Secret**

### No Supabase Dashboard:

1. Vá em **Authentication > Providers**
2. Encontre **Google** e clique para expandir
3. Ative o provider
4. Cole o **Client ID** e **Client Secret** do Google
5. Salve as configurações

---

## 3️⃣ Configurar Variáveis de Ambiente

No arquivo `.env.local`, adicione:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Mercado Pago
MP_ACCESS_TOKEN=seu_access_token
NEXT_PUBLIC_MP_PUBLIC_KEY=sua_public_key
```

---

## 4️⃣ Testar o Sistema

### Registro com E-mail:
1. Acesse `/auth/register`
2. Preencha nome, e-mail e senha
3. Clique em "Criar Conta"
4. Verifique se foi redirecionado

### Registro com Google:
1. Acesse `/auth/login`
2. Clique em "Continuar com Google"
3. Autorize o aplicativo
4. Verifique se foi redirecionado e logado

### Página Minha Conta:
1. Após login, acesse `/minha-conta`
2. Verifique as abas: Pedidos, Endereços, Perfil

---

## 🗂️ Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `context/auth-context.tsx` | Contexto de autenticação |
| `app/auth/login/page.tsx` | Página de login |
| `app/auth/register/page.tsx` | Página de registro |
| `app/auth/callback/route.ts` | Callback OAuth |
| `app/minha-conta/page.tsx` | Página de conta |
| `app/checkout/page.tsx` | Checkout transparente |
| `app/api/payment/card/route.ts` | API pagamento cartão |
| `app/api/payment/pix/route.ts` | API pagamento PIX |
| `supabase/migrations/add_user_auth_tables.sql` | Migração SQL |

---

## ❓ Troubleshooting

### Erro "Invalid login credentials"
- Verifique se o e-mail e senha estão corretos
- O e-mail deve estar verificado (se habilitado no Supabase)

### Erro no login com Google
- Verifique as credenciais OAuth no Supabase
- Confirme que o redirect URI está correto
- Verifique se o domínio está autorizado no Google Cloud

### Tabelas não existem
- Execute a migração SQL no Supabase
- Verifique se o RLS está habilitado

---

**Pronto!** Seu sistema de autenticação está configurado. 🎉
