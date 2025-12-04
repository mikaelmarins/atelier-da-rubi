-- Adicionar novos campos à tabela orders para suportar rastreamento e status de pagamento
-- Execute este script no seu Supabase SQL Editor

-- Adicionar campo de status do pagamento
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);

-- Adicionar campo de código de rastreamento
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100);

-- Adicionar campo de URL de rastreamento (ex: link dos Correios)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- Adicionar campo updated_at para acompanhar atualizações
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger na tabela orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar índice para busca por email (performance)
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Criar índice para busca por status (performance)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Comentários explicativos
COMMENT ON COLUMN orders.payment_status IS 'Status do pagamento retornado pelo Mercado Pago (approved, pending, rejected, etc)';
COMMENT ON COLUMN orders.tracking_code IS 'Código de rastreamento dos Correios ou transportadora';
COMMENT ON COLUMN orders.tracking_url IS 'URL para rastreamento do pedido (link direto dos Correios/transportadora)';
