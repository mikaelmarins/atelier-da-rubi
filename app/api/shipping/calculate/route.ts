import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ShippingProduct {
    id: number;
    quantity: number;
    weight: number; // kg
    height: number; // cm
    width: number;  // cm
    length: number; // cm
}

interface ShippingRequest {
    cep_destino: string;
    products: ShippingProduct[];
}

export async function POST(request: NextRequest) {
    try {
        const body: ShippingRequest = await request.json();
        const { cep_destino, products } = body;

        if (!cep_destino || !products || products.length === 0) {
            return NextResponse.json({ error: 'CEP e produtos são obrigatórios' }, { status: 400 });
        }

        // Buscar token do Melhor Envio
        const { data: tokenData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'melhor_envio_token')
            .single();

        if (!tokenData?.value) {
            // Fallback: cálculo simulado se não tiver integração
            return calculateFallback(cep_destino, products);
        }

        const token = JSON.parse(tokenData.value);

        // Verificar se token expirou
        if (Date.now() > token.expires_at) {
            // TODO: Implementar refresh do token
            return calculateFallback(cep_destino, products);
        }

        const isSandbox = process.env.MELHOR_ENVIO_IS_SANDBOX === 'true';
        const baseUrl = isSandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://melhorenvio.com.br';

        // Calcular dimensões totais do pacote
        const totalWeight = products.reduce((sum, p) => sum + (p.weight * p.quantity), 0);
        const maxHeight = Math.max(...products.map(p => p.height || 2));
        const maxWidth = Math.max(...products.map(p => p.width || 11));
        const totalLength = products.reduce((sum, p) => sum + ((p.length || 16) * p.quantity), 0);

        // Chamar API do Melhor Envio
        const response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token.access_token}`,
                'User-Agent': 'AtelierDaRubi/1.0',
            },
            body: JSON.stringify({
                from: {
                    postal_code: '28930000', // CEP de Arraial do Cabo
                },
                to: {
                    postal_code: cep_destino.replace(/\D/g, ''),
                },
                products: products.map(p => ({
                    id: String(p.id),
                    width: p.width || 11,
                    height: p.height || 2,
                    length: p.length || 16,
                    weight: p.weight || 0.3,
                    insurance_value: 0,
                    quantity: p.quantity,
                })),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Melhor Envio API error:', errorData);
            return calculateFallback(cep_destino, products);
        }

        const shippingOptions = await response.json();

        // Filtrar opções válidas (sem erro)
        const validOptions = shippingOptions.filter((opt: any) => !opt.error);

        if (validOptions.length === 0) {
            return calculateFallback(cep_destino, products);
        }

        // Formatar resposta
        return NextResponse.json({
            success: true,
            options: validOptions.map((opt: any) => ({
                id: opt.id,
                name: opt.name,
                company: opt.company?.name || opt.name,
                price: parseFloat(opt.price),
                delivery_time: opt.delivery_time,
                currency: 'BRL',
            })),
        });

    } catch (error) {
        console.error('Shipping calculation error:', error);
        return NextResponse.json({
            error: 'Erro ao calcular frete',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

// Cálculo simulado quando não tem integração
function calculateFallback(cep: string, products: ShippingProduct[]) {
    const totalWeight = products.reduce((sum, p) => sum + ((p.weight || 0.3) * p.quantity), 0);

    // Região dos Lagos (CEP 289xx) = Frete grátis
    if (cep.startsWith('289')) {
        return NextResponse.json({
            success: true,
            fallback: true,
            options: [
                { id: 1, name: 'Entrega Local', company: 'Atelier da Rubi', price: 0, delivery_time: 3 },
            ],
        });
    }

    // Cálculo baseado em peso: R$ 20 base + R$ 15/kg
    const basePrice = 20;
    const pricePerKg = 15;
    const calculatedPrice = basePrice + (totalWeight * pricePerKg);

    return NextResponse.json({
        success: true,
        fallback: true,
        options: [
            { id: 1, name: 'PAC', company: 'Correios (Simulado)', price: calculatedPrice, delivery_time: 10 },
            { id: 2, name: 'SEDEX', company: 'Correios (Simulado)', price: calculatedPrice * 1.5, delivery_time: 5 },
        ],
    });
}
