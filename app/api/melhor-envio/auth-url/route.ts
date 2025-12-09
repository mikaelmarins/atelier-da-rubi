import { NextResponse } from 'next/server';

export async function GET() {
    const isSandbox = process.env.MELHOR_ENVIO_IS_SANDBOX === 'true';
    const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
    const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;

    const baseUrl = isSandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://melhorenvio.com.br';

    // Escopos necessários para calcular frete e gerar etiquetas
    const scopes = 'shipping-calculate shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print';

    const url = `${baseUrl}/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&state=b3t5k6`;

    return NextResponse.json({ url });
}
