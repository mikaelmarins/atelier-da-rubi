-- Adicionar tabelas para sistema de usuários
-- Execute no Supabase SQL Editor

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de endereços dos usuários
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Casa',
    zip TEXT NOT NULL,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    complement TEXT,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Trigger para atualizar updated_at em user_profiles
CREATE OR REPLACE FUNCTION update_user_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_updated_at();

-- Adicionar campo user_id na tabela orders (se não existir)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Políticas de segurança (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuários podem gerenciar apenas seus próprios endereços
CREATE POLICY "Users can view own addresses" ON user_addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON user_addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON user_addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON user_addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE user_profiles IS 'Perfis de usuários do sistema';
COMMENT ON TABLE user_addresses IS 'Endereços salvos dos usuários';
