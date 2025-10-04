-- =====================================================
-- SETUP COMPLETO DO BANCO DE DADOS ATELIER DA RUBI
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: products
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price TEXT NOT NULL,
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  material TEXT,
  tamanhos TEXT[] DEFAULT ARRAY[]::TEXT[],
  cuidados TEXT,
  tempo_producao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: product_images
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: admin_users
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, display_order);

-- =====================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Atualizar updated_at em products
-- =====================================================
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Produtos são públicos" ON products;
DROP POLICY IF EXISTS "Imagens são públicas" ON product_images;
DROP POLICY IF EXISTS "Admin pode tudo em produtos" ON products;
DROP POLICY IF EXISTS "Admin pode tudo em imagens" ON product_images;
DROP POLICY IF EXISTS "Admin pode ver admin_users" ON admin_users;

-- Políticas de leitura pública
CREATE POLICY "Produtos são públicos" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Imagens são públicas" 
  ON product_images FOR SELECT 
  USING (true);

-- Políticas para usuários autenticados (admin)
CREATE POLICY "Admin pode inserir produtos" 
  ON products FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin pode atualizar produtos" 
  ON products FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode deletar produtos" 
  ON products FOR DELETE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode inserir imagens" 
  ON product_images FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin pode atualizar imagens" 
  ON product_images FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode deletar imagens" 
  ON product_images FOR DELETE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode ver admin_users" 
  ON admin_users FOR SELECT 
  USING (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE: Criar bucket para imagens
-- =====================================================

-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas antigas de storage
DROP POLICY IF EXISTS "Imagens públicas" ON storage.objects;
DROP POLICY IF EXISTS "Admin pode fazer upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin pode deletar" ON storage.objects;
DROP POLICY IF EXISTS "Admin pode atualizar" ON storage.objects;

-- Políticas de storage - leitura pública
CREATE POLICY "Imagens públicas" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'product-images');

-- Políticas de storage - admin pode fazer upload
CREATE POLICY "Admin pode fazer upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );

-- Políticas de storage - admin pode deletar
CREATE POLICY "Admin pode deletar" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );

-- Políticas de storage - admin pode atualizar
CREATE POLICY "Admin pode atualizar" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir usuário admin padrão
INSERT INTO admin_users (email, name) 
VALUES ('rubiananascimento1@gmail.com', 'Rubiana Lima')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VERIFICAÇÕES
-- =====================================================

-- Verificar estrutura
DO $$
BEGIN
  RAISE NOTICE 'Tabelas criadas com sucesso!';
  RAISE NOTICE 'Total de produtos: %', (SELECT COUNT(*) FROM products);
  RAISE NOTICE 'Total de imagens: %', (SELECT COUNT(*) FROM product_images);
  RAISE NOTICE 'Total de admins: %', (SELECT COUNT(*) FROM admin_users);
END $$;
