-- Habilitar Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Criar tabela de produtos
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

-- Criar tabela de imagens dos produtos
CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de usuários admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(display_order);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de produtos
CREATE POLICY "Produtos são públicos" ON products
  FOR SELECT USING (true);

CREATE POLICY "Imagens são públicas" ON product_images
  FOR SELECT USING (true);

-- Permitir todas operações para usuários autenticados (admin)
CREATE POLICY "Admin pode tudo em produtos" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode tudo em imagens" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode ver admin_users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Inserir usuário admin padrão
INSERT INTO admin_users (email, name) 
VALUES ('rubiananascimento1@gmail.com', 'Rubiana Lima')
ON CONFLICT (email) DO NOTHING;

-- Criar bucket para imagens de produtos no Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Política de storage - permitir leitura pública
CREATE POLICY "Imagens públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Política de storage - permitir upload para admin
CREATE POLICY "Admin pode fazer upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );

-- Política de storage - permitir delete para admin
CREATE POLICY "Admin pode deletar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );
