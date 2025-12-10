-- =====================================================
-- ATUALIZAÇÃO TABELA COUPONS - MAIS OPÇÕES
-- Execute no Supabase SQL Editor
-- =====================================================

-- Adicionar novos campos ao cupom
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT false;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS shipping_discount_percent INTEGER DEFAULT 0;

-- Comentários explicativos
COMMENT ON COLUMN coupons.discount_type IS 'percentage = desconto %, fixed = valor fixo em R$';
COMMENT ON COLUMN coupons.free_shipping IS 'Se true, o cupom dá frete grátis';
COMMENT ON COLUMN coupons.shipping_discount_percent IS 'Desconto percentual no frete (0-100)';
COMMENT ON COLUMN coupons.max_uses IS 'Limite máximo de usos (null = ilimitado)';
COMMENT ON COLUMN coupons.valid_until IS 'Data de expiração do cupom';

SELECT 'Coupons atualizados!' as status;
