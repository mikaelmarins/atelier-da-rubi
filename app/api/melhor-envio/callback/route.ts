import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Código de autorização não encontrado' }, { status: 400 });
    }

    const isSandbox = process.env.MELHOR_ENVIO_IS_SANDBOX === 'true';
    const baseUrl = isSandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://melhorenvio.com.br';

    try {
        // Trocar code pelo access_token
        const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
                client_secret: process.env.MELHOR_ENVIO_SECRET,
                redirect_uri: process.env.MELHOR_ENVIO_REDIRECT_URI,
                code: code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || tokenData.error) {
            console.error('Melhor Envio token error:', tokenData);
            return NextResponse.json({
                error: 'Falha ao obter token',
                details: tokenData
            }, { status: 400 });
        }

        // Salvar token no banco (tabela settings)
        const { error: upsertError } = await supabase
            .from('settings')
            .upsert({
                key: 'melhor_envio_token',
                value: JSON.stringify({
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_at: Date.now() + (tokenData.expires_in * 1000),
                }),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'key' });

        if (upsertError) {
            console.error('Error saving token:', upsertError);
            // Se a tabela não existir, criar e tentar de novo
            if (upsertError.code === '42P01') {
                return NextResponse.json({
                    error: 'Tabela settings não existe. Execute a migração no Supabase.',
                    sql: `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value JSONB,
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );`
                }, { status: 500 });
            }
        }

        // Redirecionar para página de sucesso
        return NextResponse.redirect(new URL('/admin/integracoes?success=true', request.url));

    } catch (error) {
        console.error('Melhor Envio callback error:', error);
        return NextResponse.json({
            error: 'Erro interno ao processar autorização',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
