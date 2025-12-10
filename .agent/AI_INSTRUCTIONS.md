# 🤖 INSTRUÇÕES PARA AGENTES DE IA - ATELIER DA RUBI

> Este documento contém todas as informações necessárias para que um agente de IA entenda e trabalhe corretamente neste projeto.

---

## 📌 RESUMO EXECUTIVO

**Projeto:** E-commerce de artesanato para bebês e gestantes
**Stack:** Next.js 15 + TypeScript + Supabase + Tailwind CSS
**Padrão:** App Router (não Pages Router)
**Estilo:** shadcn/ui components + Tailwind
**Banco:** Supabase (PostgreSQL com RLS habilitado)

---

## 🏗️ ARQUITETURA E PADRÕES DE CÓDIGO

### Estrutura de Pastas
```
app/                    → Páginas e rotas (App Router)
  └── api/              → API Routes (Route Handlers)
components/             → Componentes React reutilizáveis
  └── ui/               → shadcn/ui (NÃO MODIFICAR)
context/                → React Context para estado global
hooks/                  → Custom hooks
lib/                    → Serviços e utilitários
database/               → Scripts SQL de migração
public/                 → Assets estáticos
```

### Convenções de Nomenclatura
- **Arquivos:** kebab-case (`product-service.ts`)
- **Componentes:** PascalCase (`ProductCard.tsx` ou `product-card.tsx`)
- **Funções:** camelCase (`loadProducts`)
- **Constantes:** UPPER_SNAKE_CASE (`STATUS_CONFIG`)
- **Tipos/Interfaces:** PascalCase (`interface ProductWithImages`)

### Padrão de Páginas (App Router)
```tsx
// app/exemplo/page.tsx
"use client"  // Só se usar hooks de cliente

import { ... } from "..."

export default function ExemploPage() {
    return (
        <div className="container mx-auto px-4 py-24 pt-28 min-h-screen">
            {/* pt-28 para compensar header fixo */}
        </div>
    )
}
```

### Padrão de API Routes
```tsx
// app/api/exemplo/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Para operações admin, usar service role:
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
    try {
        // lógica
        return NextResponse.json({ data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
```

---

## 🔑 AUTENTICAÇÃO E AUTORIZAÇÃO

### Cliente Supabase
```typescript
// lib/supabase.ts exporta:
import { supabase } from "@/lib/supabase"

// Para actions de usuário logado
const { data: { user } } = await supabase.auth.getUser()
```

### Context de Auth
```typescript
// Usar o hook useAuth
import { useAuth } from "@/context/auth-context"

const { user, profile, signOut, loading } = useAuth()

// profile tem: id, name, email, phone, role
// role pode ser: "admin" ou "customer"
```

### Proteção de Rotas Admin
- APIs admin usam `SUPABASE_SERVICE_ROLE_KEY` para bypass RLS
- Páginas admin verificam `profile?.role === "admin"`

---

## 📦 PRINCIPAIS SERVIÇOS

### ProductServiceSupabase (lib/product-service.ts)
```typescript
import { ProductServiceSupabase } from "@/lib/product-service"

// Métodos disponíveis:
await ProductServiceSupabase.getAllProducts()
await ProductServiceSupabase.getProductById(id)
await ProductServiceSupabase.createProduct(data)
await ProductServiceSupabase.updateProduct(id, data)
await ProductServiceSupabase.deleteProduct(id)
await ProductServiceSupabase.getStats()
```

### OrderService (lib/order-service.ts)
```typescript
import { OrderService } from "@/lib/order-service"

await OrderService.createOrder(orderData)
await OrderService.getUserOrders(userId)
await OrderService.updateOrderStatus(orderId, status)
```

### Email Service (lib/email-service.ts)
```typescript
import { 
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail
} from "@/lib/email-service"
```

---

## 🛒 CONTEXTO DO CARRINHO

```typescript
import { useCart } from "@/context/cart-context"

const { 
    items,           // CartItem[]
    addItem,         // (product, quantity, customization?) => void
    removeItem,      // (productId) => void
    updateQuantity,  // (productId, quantity) => void
    clearCart,       // () => void
    total,           // number
    itemsCount       // number
} = useCart()

// CartItem: { id, name, price, quantity, image, customization? }
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: products
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
description     TEXT
price           DECIMAL NOT NULL
original_price  DECIMAL          -- Para mostrar "de/por"
category        TEXT
subcategory     TEXT
featured        BOOLEAN DEFAULT false
stock           INTEGER DEFAULT 0
allow_customization BOOLEAN DEFAULT false
created_at      TIMESTAMP
```

### Tabela: orders
```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES auth.users
status           TEXT DEFAULT 'pending'
                 -- pending, paid, processing, shipped, delivered, cancelled
total            DECIMAL
subtotal         DECIMAL
shipping_cost    DECIMAL
discount         DECIMAL DEFAULT 0
coupon_code      TEXT
items            JSONB            -- Array de itens do pedido
shipping_address JSONB            -- Objeto com endereço
tracking_code    TEXT
created_at       TIMESTAMP
```

### Tabela: coupons
```sql
id                       UUID PRIMARY KEY
code                     TEXT UNIQUE NOT NULL
discount_type            TEXT        -- 'percentage' ou 'fixed'
discount_value           DECIMAL
free_shipping            BOOLEAN DEFAULT false
shipping_discount_percent INTEGER DEFAULT 0
min_order_value          DECIMAL
max_uses                 INTEGER
current_uses             INTEGER DEFAULT 0
valid_from               TIMESTAMP
valid_until              TIMESTAMP
active                   BOOLEAN DEFAULT true
```

---

## 🎨 DESIGN SYSTEM

### Cores Principais (Tailwind)
- **Primária:** `pink-500`, `pink-600` (hover)
- **Secundária:** `purple-500`
- **Sucesso:** `green-500`, `emerald-500`
- **Alerta:** `yellow-500`
- **Erro:** `red-500`
- **Texto:** `gray-900`, `gray-700`, `gray-500`
- **Background:** `white`, `gray-50`, `pink-50`

### Componentes UI (shadcn)
```typescript
// Imports padrão
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
```

### Ícones (Lucide React)
```typescript
import { 
    ShoppingCart, Heart, User, Package, 
    Truck, CheckCircle, Clock, XCircle,
    Plus, Minus, Edit, Trash2
} from "lucide-react"
```

### Animações (Framer Motion)
```typescript
import { motion } from "framer-motion"

<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
>
```

---

## 📧 SISTEMA DE EMAILS

### Tipos de Email Suportados
1. `welcome` - Boas-vindas ao criar conta
2. `order_confirmation` - Confirmação de pedido
3. `status_update` - Atualização de status (pago, enviado, etc)
4. `password_reset` - Recuperação de senha

### Envio via API
```typescript
// POST /api/email
{
    "type": "order_confirmation",
    "data": { /* dados do pedido */ }
}
```

### Preview de Emails (Desenvolvimento)
```
GET /api/email/preview?type=welcome
GET /api/email/preview?type=order
GET /api/email/preview?type=shipped
GET /api/email/preview?type=delivered
```

---

## ⚠️ CUIDADOS IMPORTANTES

### 1. RLS (Row Level Security)
- Está HABILITADO em todas as tabelas
- Para operações admin, use `SUPABASE_SERVICE_ROLE_KEY`
- Cliente normal só vê seus próprios dados

### 2. Header Fixo
- O header tem `position: fixed` e `z-50`
- Páginas devem ter `pt-28` (padding-top) para compensar

### 3. Imagens de Produtos
- Armazenadas no Supabase Storage bucket `product-images`
- Upload via API admin

### 4. Formatação de Moeda
```typescript
import { formatCurrency } from "@/lib/utils"
formatCurrency(299.90) // "R$ 299,90"
```

### 5. Nunca fazer direto no cliente:
- ❌ Atualizar pedidos de outros usuários
- ❌ Criar/editar produtos sem ser admin
- ❌ Acessar dados de outros clientes

---

## 🔄 FLUXOS PRINCIPAIS

### Fluxo de Compra
1. Cliente adiciona produtos ao carrinho (`cart-context`)
2. Vai para checkout (`/checkout`)
3. Preenche endereço → calcula frete (`/api/shipping`)
4. Aplica cupom (opcional) (`/api/coupons`)
5. Finaliza pedido → cria em `orders`
6. Email de confirmação é enviado
7. Redireciona para página de sucesso

### Fluxo de Status do Pedido
```
pending → paid → processing → shipped → delivered
                                    ↘ cancelled
```
Cada mudança de status:
1. Atualiza no banco via `/api/admin/orders`
2. Envia email automático ao cliente

---

## 📝 TAREFAS PENDENTES (Referência)

### Implementado ✅
- [x] Catálogo com filtros
- [x] Carrinho
- [x] Checkout com frete
- [x] Cupons de desconto
- [x] Emails transacionais
- [x] Área do cliente
- [x] Painel admin completo

### A Fazer 🔲
- [ ] Integração de pagamento (gateway)
- [ ] Wishlist (lista de desejos)
- [ ] Sistema de avaliações
- [ ] Newsletter

---

## 🧪 TESTANDO FUNCIONALIDADES

### Servidor de Desenvolvimento
```bash
npm run dev
# Acesse http://localhost:3000
```

### Testar Emails (sem enviar)
```bash
# Visualizar template no navegador
http://localhost:3000/api/email/preview?type=welcome
```

### Testar API de Cupons
```bash
# Validar cupom
curl -X POST http://localhost:3000/api/coupons \
  -H "Content-Type: application/json" \
  -d '{"action":"validate","code":"TESTE10","orderTotal":100}'
```

---

## 📚 RECURSOS ÚTEIS

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)
- [Framer Motion](https://www.framer.com/motion)

---

## 💡 DICAS PARA O AGENTE

1. **Antes de criar arquivos:** Verifique se já existe algo similar
2. **Ao editar componentes UI:** NÃO modifique `components/ui/*`
3. **Ao criar APIs:** Lembre-se do tratamento de erros
4. **Ao fazer queries:** Considere o RLS do Supabase
5. **Ao criar páginas:** Adicione `pt-28` para compensar header
6. **Ao estilizar:** Use as cores do design system
7. **Ao criar formulários:** Use componentes shadcn/ui

---

*Última atualização: Dezembro 2024*
