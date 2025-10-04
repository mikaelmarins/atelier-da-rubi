-- Script para popular dados de exemplo (OPCIONAL)
-- Execute apenas se quiser alguns produtos de exemplo

-- Limpar dados existentes (CUIDADO!)
-- DELETE FROM product_images;
-- DELETE FROM products;

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, category, featured, material, tamanhos, cuidados, tempo_producao)
VALUES
  (
    'Kit Berço Premium',
    'Jogo de berço completo com bordados delicados e acabamento premium',
    'R$ 189,90',
    'jogos-berco',
    true,
    '100% Algodão Premium',
    ARRAY['Berço Padrão', 'Mini Berço'],
    'Lavar à mão com água fria, secar à sombra',
    '10 a 15 dias úteis'
  ),
  (
    'Toalha Recém-Nascido Bordada',
    'Toalha premium com bordado personalizado e acabamento delicado',
    'R$ 85,90',
    'toalhas',
    true,
    '100% Algodão Orgânico',
    ARRAY['70x70cm', '80x80cm'],
    'Lavar à máquina em água fria, secar à sombra',
    '5 a 7 dias úteis'
  ),
  (
    'Kit Gestante Completo',
    'Kit completo com bolsas e acessórios bordados para gestante',
    'R$ 145,90',
    'kit-gestante',
    true,
    'Tecido Premium com Bordados',
    ARRAY['Único'],
    'Lavar à mão, secar à sombra',
    '7 a 10 dias úteis'
  );

-- Inserir imagens de placeholder para os produtos
WITH product_ids AS (
  SELECT id FROM products ORDER BY id LIMIT 3
)
INSERT INTO product_images (product_id, image_url, display_order)
SELECT 
  id,
  '/placeholder.svg?height=600&width=600&text=Produto+' || ROW_NUMBER() OVER (PARTITION BY id),
  ROW_NUMBER() OVER (PARTITION BY id) - 1
FROM product_ids, generate_series(1, 3);

-- Verificar inserção
SELECT 
  p.id,
  p.name,
  COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name
ORDER BY p.id;
