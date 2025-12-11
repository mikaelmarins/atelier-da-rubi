# 🌸 Atelier da Rubi - E-commerce de Artesanato

> Plataforma de e-commerce para venda de produtos artesanais de bordado, especializada em itens para bebês e gestantes.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Páginas](#-páginas)
- [APIs](#-apis)
- [Banco de Dados](#-banco-de-dados)
- [Deploy](#-deploy)

---

## 🎯 Sobre o Projeto

O **Atelier da Rubi** é um e-commerce artesanal localizado em Arraial do Cabo, RJ. Especializado em:

- 🧵 Jogos de berço personalizados
- 🛁 Toalhas com nome bordado
- 👗 Vestidos e macacões artesanais
- 🎁 Kits gestante exclusivos

O projeto foi desenvolvido com foco em:
- **Performance** - Next.js 15 com Server Components
- **Experiência do usuário** - Design moderno e responsivo
- **Gestão completa** - Painel administrativo robusto

---

## ✨ Funcionalidades

### Para Clientes
- ✅ Catálogo de produtos com filtros e busca
- ✅ Carrinho de compras persistente
- ✅ Checkout completo com cálculo de frete
- ✅ Autenticação de usuários
- ✅ Área "Minha Conta" com histórico de pedidos
- ✅ Alteração de senha
- ✅ Emails transacionais automáticos

### Para Administradores
- ✅ Dashboard com estatísticas
- ✅ CRUD de produtos com múltiplas imagens
- ✅ CRUD de categorias
- ✅ Gerenciamento de pedidos
- ✅ Atualização de status com envio de email
- ✅ Sistema de cupons de desconto
- ✅ Configuração do carrossel de destaques
- ✅ Integração com Melhor Envio (frete)

### Sistema de Cupons
- ✅ Desconto por porcentagem ou valor fixo
- ✅ Frete grátis
- ✅ Desconto percentual no frete
- ✅ Valor mínimo de pedido
- ✅ Limite de usos
- ✅ Data de validade

### Emails Transacionais
- ✅ Boas-vindas ao criar conta
- ✅ Confirmação de pedido
- ✅ Atualização de status (pago, preparando, enviado, entregue)
- ✅ Recuperação de senha

---

## 🛠 Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS |
| **Componentes** | shadcn/ui |
| **Animações** | Framer Motion |
| **Banco de Dados** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **Armazenamento** | Supabase Storage |
| **Email** | Resend |
| **Frete** | Melhor Envio API |
| **Ícones** | Lucide React |

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- Conta no Supabase
- Conta no Resend (para emails)

### Passos

\`\`\`bash
# Clonar o repositório
git clone https://github.com/mikaelmarins/atelier-da-rubi.git

# Entrar no diretório
cd atelier-da-rubi

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Rodar em desenvolvimento
npm run dev
\`\`\`

O projeto estará disponível em `http://localhost:3000`

---

## 🔐 Variáveis de Ambiente

Criar um arquivo `.env.local` na raiz do projeto:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=Atelier da Rubi <noreply@seudominio.com.br>

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Melhor Envio (opcional)
MELHOR_ENVIO_CLIENT_ID=seu-client-id
MELHOR_ENVIO_CLIENT_SECRET=seu-client-secret
MELHOR_ENVIO_REDIRECT_URI=http://localhost:3000/api/melhor-envio/callback
\`\`\`

---

## 📁 Estrutura do Projeto

\`\`\`
atelier-da-rubi/
├── app/                      # Páginas (App Router)
│   ├── admin/               # Painel administrativo
│   │   ├── carousel/        # Config do carrossel
│   │   ├── categories/      # CRUD categorias
│   │   ├── coupons/         # CRUD cupons
│   │   ├── orders/          # Gerenciar pedidos
│   │   ├── products/        # CRUD produtos
│   │   └── login/           # Login admin
│   ├── api/                 # API Routes
│   │   ├── admin/           # APIs admin
│   │   ├── coupons/         # API cupons
│   │   ├── email/           # API emails
│   │   ├── orders/          # API pedidos
│   │   └── shipping/        # API frete
│   ├── auth/                # Autenticação
│   ├── carrinho/            # Carrinho
│   ├── catalogo/            # Catálogo
│   ├── checkout/            # Checkout
│   └── minha-conta/         # Área do cliente
├── components/              # Componentes React
│   ├── ui/                  # shadcn/ui
│   ├── admin/               # Componentes admin
│   └── auth/                # Componentes auth
├── context/                 # Context API
│   ├── auth-context.tsx     # Autenticação
│   └── cart-context.tsx     # Carrinho
├── hooks/                   # Custom hooks
├── lib/                     # Utilitários e serviços
│   ├── supabase.ts          # Cliente Supabase
│   ├── product-service.ts   # CRUD produtos
│   ├── order-service.ts     # CRUD pedidos
│   └── email-service.ts     # Serviço de emails
├── database/                # Scripts SQL
└── public/                  # Assets estáticos
\`\`\`

---

## 📱 Páginas

### Públicas
| Rota | Descrição |
|------|-----------|
| `/` | Home com hero, carrossel, sobre, contato |
| `/catalogo` | Grid de produtos com filtros |
| `/catalogo/[id]` | Detalhe do produto |
| `/carrinho` | Carrinho de compras |
| `/checkout` | Finalização de compra |
| `/minha-conta` | Área do cliente (pedidos, perfil) |
| `/auth/login` | Login de usuário |
| `/auth/register` | Cadastro de usuário |

### Administrativas
| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard |
| `/admin/products` | Gerenciar produtos |
| `/admin/products/[id]` | Editar produto |
| `/admin/categories` | Gerenciar categorias |
| `/admin/orders` | Gerenciar pedidos |
| `/admin/orders/[id]` | Detalhes do pedido |
| `/admin/coupons` | Gerenciar cupons |
| `/admin/carousel` | Configurar carrossel |

---

## 🔌 APIs

### Públicas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/orders` | Listar pedidos do usuário |
| POST | `/api/orders` | Criar pedido |
| POST | `/api/shipping` | Calcular frete |
| GET | `/api/shipping/tracking` | Rastrear pedido |
| POST | `/api/coupons` (validate) | Validar cupom |

### Admin (requer autenticação)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST/PUT/DELETE | `/api/admin/products` | CRUD produtos |
| GET/PUT | `/api/admin/orders` | Gerenciar pedidos |
| GET/POST/PUT/DELETE | `/api/coupons` | CRUD cupons |

### Email
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/email` | Enviar email |
| GET | `/api/email/preview` | Visualizar template |

---

## 🗄 Banco de Dados

### Principais Tabelas

\`\`\`sql
-- Usuários (gerenciado pelo Supabase Auth)
profiles (id, name, email, phone, role)

-- Produtos
products (id, name, description, price, category, featured, stock, ...)
product_images (id, product_id, url, display_order)

-- Categorias
categories (id, name, slug, description, image_url)

-- Pedidos
orders (id, user_id, status, total, items, shipping_address, ...)

-- Cupons
coupons (id, code, discount_type, discount_value, free_shipping, ...)

-- Carrossel
carousel_config (id, product_id, display_order)
\`\`\`

### RLS (Row Level Security)
- Habilitado em todas as tabelas
- Usuários só veem seus próprios pedidos
- Operações admin usam `service_role_key`

---

## 🚢 Deploy

### Vercel (Recomendado)

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis no Vercel
Mesmas do `.env.local`, trocando `NEXT_PUBLIC_BASE_URL` pela URL de produção.

---

## 📞 Contato

**Atelier da Rubi**
- 📍 Arraial do Cabo, RJ
- 📱 WhatsApp: (22) 99789-0934
- 🌐 atelierdarubi.com.br

---

## 📝 Licença

Este projeto é privado e de uso exclusivo do Atelier da Rubi.

---

*Desenvolvido com ❤️ para Rubiana Lima*
