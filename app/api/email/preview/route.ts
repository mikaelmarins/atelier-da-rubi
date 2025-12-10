import { NextRequest, NextResponse } from "next/server"

// Preview de emails - mostra o HTML sem enviar
// Útil para desenvolvimento e design de emails

const STORE_NAME = 'Atelier da Rubi'
const STORE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

function baseTemplate(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${STORE_NAME}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #fdf2f8; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
    .order-item { border-bottom: 1px solid #e5e7eb; padding: 12px 0; }
    .total-row { font-weight: bold; font-size: 18px; color: #ec4899; }
    .tracking-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .address-box { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ ${STORE_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>${STORE_NAME} - Peças artesanais com amor</p>
      <p>Arraial do Cabo, RJ</p>
      <p><a href="${STORE_URL}" style="color: #ec4899;">www.atelierdarubi.com.br</a></p>
    </div>
  </div>
</body>
</html>
  `
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "welcome"

  let html = ""

  switch (type) {
    case "welcome":
      html = baseTemplate(`
        <h2 style="color: #1f2937;">Bem-vindo(a) ao ${STORE_NAME}! 🌸</h2>
        <p>Olá <strong>Cliente Exemplo</strong>,</p>
        <p>É uma alegria ter você com a gente! Aqui você encontra peças artesanais únicas, feitas com muito amor e carinho para os pequenos.</p>
        
        <div style="background: #fdf2f8; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px;">🎁 Use o cupom <strong style="color: #ec4899;">BEMVINDO10</strong></p>
          <p style="margin: 5px 0 0; color: #6b7280;">e ganhe 10% de desconto na primeira compra!</p>
        </div>
        
        <p>Explore nosso catálogo de:</p>
        <ul>
          <li>✨ Jogos de berço personalizados</li>
          <li>🧸 Toalhas com nome bordado</li>
          <li>👗 Vestidos e macacões artesanais</li>
          <li>🎀 Kits gestante exclusivos</li>
        </ul>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${STORE_URL}/catalogo" class="button">Explorar Catálogo</a>
        </p>
      `)
      break

    case "order":
      html = baseTemplate(`
        <h2 style="color: #1f2937;">Obrigado pelo seu pedido! 🎉</h2>
        <p>Olá <strong>Maria Silva</strong>,</p>
        <p>Recebemos seu pedido e estamos preparando com muito carinho.</p>
        
        <div style="background: #fdf2f8; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Número do Pedido</p>
          <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #ec4899;">#A1B2C3D4</p>
        </div>
        
        <h3 style="color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Itens do Pedido</h3>
        
        <div class="order-item">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>Kit Berço Personalizado - Ursinhos</strong>
              <br><small style="color: #6b7280;">Personalização: Nome: LUCAS | Cor: Azul Bebê</small>
            </div>
            <div style="text-align: right;">
              <span>1x R$ 289,90</span>
            </div>
          </div>
        </div>
        
        <div class="order-item">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>Toalha com Capuz Bordada</strong>
              <br><small style="color: #6b7280;">Personalização: Nome: LUCAS</small>
            </div>
            <div style="text-align: right;">
              <span>1x R$ 79,90</span>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Subtotal:</span>
            <span>R$ 369,80</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #16a34a;">
            <span>Desconto (BEMVINDO10):</span>
            <span>- R$ 36,98</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Frete:</span>
            <span>Grátis! 🎁</span>
          </div>
          <div class="total-row" style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            <span>Total:</span>
            <span>R$ 332,82</span>
          </div>
        </div>
        
        <div class="address-box">
          <h4 style="margin-top: 0; color: #1f2937;">📍 Endereço de Entrega</h4>
          <p style="margin: 0; color: #4b5563;">
            Rua das Flores, 123, Apto 101<br>
            Centro<br>
            Rio de Janeiro - RJ<br>
            CEP: 20000-000
          </p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${STORE_URL}/catalogo" class="button">Ver Catálogo</a>
        </p>
      `)
      break

    case "shipped":
      html = baseTemplate(`
        <h2 style="color: #1f2937;">📦 Pedido Enviado!</h2>
        <p>Olá <strong>Maria Silva</strong>,</p>
        <p>Seu pedido saiu para entrega! Em breve chegará até você.</p>
        
        <div style="background: #fdf2f8; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Número do Pedido</p>
          <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #ec4899;">#A1B2C3D4</p>
        </div>
        
        <div class="tracking-box">
          <h4 style="margin-top: 0; color: #16a34a;">🚚 Rastreamento</h4>
          <p style="margin: 0;">
            <strong>Código:</strong> AA123456789BR
          </p>
          <p style="margin: 10px 0 0;">
            <a href="https://rastreamento.correios.com.br" class="button" style="background: #16a34a;">Rastrear Pedido</a>
          </p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${STORE_URL}/catalogo" class="button">Ver Catálogo</a>
        </p>
      `)
      break

    case "delivered":
      html = baseTemplate(`
        <h2 style="color: #1f2937;">🎁 Pedido Entregue!</h2>
        <p>Olá <strong>Maria Silva</strong>,</p>
        <p>Seu pedido foi entregue. Esperamos que você ame suas peças!</p>
        
        <div style="background: #fdf2f8; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Número do Pedido</p>
          <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #ec4899;">#A1B2C3D4</p>
        </div>
        
        <div style="background: #fef9c3; border: 1px solid #facc15; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 16px;">⭐ Gostou das suas peças?</p>
          <p style="margin: 5px 0 0; color: #6b7280;">Deixe uma avaliação e ajude outras mamães!</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${STORE_URL}/catalogo" class="button">Ver Catálogo</a>
        </p>
      `)
      break

    default:
      return NextResponse.json({ error: "Tipo inválido. Use: welcome, order, shipped, delivered" })
  }

  // Retorna o HTML diretamente para visualização no browser
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  })
}
