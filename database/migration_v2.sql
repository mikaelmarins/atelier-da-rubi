-- =====================================================
-- ATELIER DA RUBI - SCRIPT DE ATUALIZAÇÃO DO BANCO
-- Execute no Supabase SQL Editor
-- Data: 10/12/2024 - v2.2 (CORRIGIDO JSON)
-- =====================================================

-- =====================================================
-- 1. ATUALIZAÇÃO DA TABELA ORDERS
-- =====================================================

-- Adicionar colunas para integração Melhor Envio
ALTER TABLE orders ADD COLUMN IF NOT EXISTS melhor_envio_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- =====================================================
-- 2. CORRIGIR TABELA SETTINGS (value é JSON)
-- =====================================================

-- Adicionar coluna description se não existir
ALTER TABLE settings ADD COLUMN IF NOT EXISTS description TEXT;

-- Inserir configurações padrão (value como JSON string)
INSERT INTO settings (key, value) VALUES
    ('store_name', '"Atelier da Rubi"'),
    ('store_email', '"contato@atelierdarubi.com.br"'),
    ('store_phone', '"(22) 99999-9999"'),
    ('store_address', '"Arraial do Cabo, RJ"'),
    ('free_shipping_min', '299')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 3. TABELA DE CUPONS DE DESCONTO
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para cupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. TABELA DE WISHLIST (LISTA DE DESEJOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- RLS para wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. TABELA DE AVALIAÇÕES DE PRODUTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- RLS para avaliações
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. TABELA DE NEWSLETTER
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- RLS para newsletter
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);

-- =====================================================
-- 8. FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Aplicar trigger em reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

SELECT 'Migração concluída com sucesso!' as status;
