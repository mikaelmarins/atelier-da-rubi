-- =====================================================
-- MIGRAÇÃO: Tabela de configuração do carrossel
-- =====================================================

-- Criar tabela para armazenar configuração do carrossel
CREATE TABLE IF NOT EXISTS carousel_config (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_carousel_order ON carousel_config(display_order);

-- Habilitar RLS
ALTER TABLE carousel_config ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (carrossel é público)
DROP POLICY IF EXISTS "Carrossel é público" ON carousel_config;
CREATE POLICY "Carrossel é público" 
  ON carousel_config FOR SELECT 
  USING (true);

-- Políticas para admin
DROP POLICY IF EXISTS "Admin pode gerenciar carrossel" ON carousel_config;
CREATE POLICY "Admin pode gerenciar carrossel" 
  ON carousel_config FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_carousel_config_updated_at ON carousel_config;
CREATE TRIGGER update_carousel_config_updated_at
  BEFORE UPDATE ON carousel_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
