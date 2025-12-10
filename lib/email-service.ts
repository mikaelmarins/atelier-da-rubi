import { Resend } from 'resend'

// Inicializar Resend (será null se não tiver API key)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'Atelier da Rubi <onboarding@resend.dev>'
const STORE_NAME = 'Atelier da Rubi'
const STORE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://atelierdarubi.com.br'

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
    customization?: string
  }>
  subtotal: number
  shippingCost: number
  discount?: number
  total: number
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zip: string
  }
  trackingCode?: string
  trackingUrl?: string
}

// Template base de email
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

// Email de confirmação de pedido
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!resend) {
    console.log('[Email] Resend não configurado - email não enviado')
    console.log('[Email] Para:', data.customerEmail)
    console.log('[Email] Pedido:', data.orderId)
    return { success: false, error: 'Email service not configured' }
  }

  const itemsHtml = data.items.map(item => `
    <div class="order-item">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <strong>${item.name}</strong>
          ${item.customization ? `<br><small style="color: #6b7280;">Personalização: ${item.customization}</small>` : ''}
        </div>
        <div style="text-align: right;">
          <span>${item.quantity}x R$ ${item.price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `).join('')

  const content = `
    <h2 style="color: #1f2937;">Obrigado pelo seu pedido! 🎉</h2>
    <p>Olá <strong>${data.customerName}</strong>,</p>
    <p>Recebemos seu pedido e estamos preparando com muito carinho. Você receberá atualizações sobre o status do seu pedido.</p>
    
    <div style="background: #fdf2f8; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">Número do Pedido</p>
      <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #ec4899;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
    </div>
    
    <h3 style="color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Itens do Pedido</h3>
    ${itemsHtml}
    
    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Subtotal:</span>
        <span>R$ ${data.subtotal.toFixed(2)}</span>
      </div>
      ${data.discount ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #16a34a;">
        <span>Desconto:</span>
        <span>- R$ ${data.discount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Frete:</span>
        <span>${data.shippingCost === 0 ? 'Grátis! 🎁' : `R$ ${data.shippingCost.toFixed(2)}`}</span>
      </div>
      <div class="total-row" style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #e5e7eb;">
        <span>Total:</span>
        <span>R$ ${data.total.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="address-box">
      <h4 style="margin-top: 0; color: #1f2937;">📍 Endereço de Entrega</h4>
      <p style="margin: 0; color: #4b5563;">
        ${data.address.street}, ${data.address.number}
        ${data.address.complement ? `, ${data.address.complement}` : ''}<br>
        ${data.address.neighborhood}<br>
        ${data.address.city} - ${data.address.state}<br>
        CEP: ${data.address.zip}
      </p>
    </div>
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="${STORE_URL}/catalogo" class="button">Ver Catálogo</a>
    </p>
  `

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `✨ Pedido #${data.orderId.slice(0, 8).toUpperCase()} confirmado - ${STORE_NAME}`,
      html: baseTemplate(content)
    })

    if (error) {
      console.error('[Email] Error sending confirmation:', error)
      // Em desenvolvimento, mostrar preview do email
      if (process.env.NODE_ENV === 'development') {
        console.log('\n========== EMAIL PREVIEW ==========')
        console.log('To:', data.customerEmail)
        console.log('Subject:', `✨ Pedido #${data.orderId.slice(0, 8).toUpperCase()} confirmado`)
        console.log('Para visualizar o HTML, rode o servidor com DEV_EMAIL_PREVIEW=true')
        console.log('===================================\n')
      }
      return { success: false, error: error.message, preview: true }
    }

    console.log('[Email] Confirmation sent:', emailData?.id)
    return { success: true, id: emailData?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { success: false, error: error.message }
  }
}

// Email de atualização de status
export async function sendOrderStatusUpdateEmail(
  data: Pick<OrderEmailData, 'orderId' | 'customerName' | 'customerEmail' | 'trackingCode' | 'trackingUrl'>,
  status: string
) {
  if (!resend) {
    console.log('[Email] Resend não configurado - status update não enviado')
    return { success: false, error: 'Email service not configured' }
  }

  const statusMessages: Record<string, { title: string; message: string; emoji: string }> = {
    paid: {
      title: 'Pagamento Confirmado!',
      message: 'Seu pagamento foi confirmado e já estamos preparando seu pedido com carinho.',
      emoji: '💳'
    },
    processing: {
      title: 'Pedido em Preparação',
      message: 'Estamos bordando, costurando e personalizando suas peças com muito amor.',
      emoji: '🧵'
    },
    shipped: {
      title: 'Pedido Enviado!',
      message: 'Seu pedido saiu para entrega! Em breve chegará até você.',
      emoji: '📦'
    },
    delivered: {
      title: 'Pedido Entregue!',
      message: 'Seu pedido foi entregue. Esperamos que você ame suas peças!',
      emoji: '🎁'
    },
    cancelled: {
      title: 'Pedido Cancelado',
      message: 'Seu pedido foi cancelado. Se você tiver dúvidas, entre em contato conosco.',
      emoji: '❌'
    }
  }

  const statusInfo = statusMessages[status] || {
    title: 'Atualização do Pedido',
    message: 'Houve uma atualização no seu pedido.',
    emoji: '📋'
  }

  let trackingHtml = ''
  if (status === 'shipped' && data.trackingCode) {
    trackingHtml = `
      <div class="tracking-box">
        <h4 style="margin-top: 0; color: #16a34a;">🚚 Rastreamento</h4>
        <p style="margin: 0;">
          <strong>Código:</strong> ${data.trackingCode}
        </p>
        ${data.trackingUrl ? `
          <p style="margin: 10px 0 0;">
            <a href="${data.trackingUrl}" class="button" style="background: #16a34a;">Rastrear Pedido</a>
          </p>
        ` : ''}
      </div>
    `
  }

  const content = `
    <h2 style="color: #1f2937;">${statusInfo.emoji} ${statusInfo.title}</h2>
    <p>Olá <strong>${data.customerName}</strong>,</p>
    <p>${statusInfo.message}</p>
    
    <div style="background: #fdf2f8; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">Número do Pedido</p>
      <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #ec4899;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
    </div>
    
    ${trackingHtml}
    
    <p style="text-align: center; margin-top: 30px;">
      <a href="${STORE_URL}/catalogo" class="button">Ver Catálogo</a>
    </p>
  `

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `${statusInfo.emoji} ${statusInfo.title} - Pedido #${data.orderId.slice(0, 8).toUpperCase()}`,
      html: baseTemplate(content)
    })

    if (error) {
      console.error('[Email] Error sending status update:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] Status update sent:', emailData?.id)
    return { success: true, id: emailData?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { success: false, error: error.message }
  }
}

// Email de boas-vindas após cadastro
export async function sendWelcomeEmail(name: string, email: string) {
  if (!resend) {
    console.log('[Email] Resend não configurado - welcome email não enviado')
    return { success: false, error: 'Email service not configured' }
  }

  const content = `
    <h2 style="color: #1f2937;">Bem-vindo(a) ao ${STORE_NAME}! 🌸</h2>
    <p>Olá <strong>${name}</strong>,</p>
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
  `

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🌸 Bem-vindo(a) ao ${STORE_NAME}!`,
      html: baseTemplate(content)
    })

    if (error) {
      console.error('[Email] Error sending welcome:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] Welcome sent:', emailData?.id)
    return { success: true, id: emailData?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { success: false, error: error.message }
  }
}

// Email de recuperação de senha
export async function sendPasswordResetEmail(name: string, email: string, resetLink: string) {
  if (!resend) {
    console.log('[Email] Resend não configurado - password reset não enviado')
    return { success: false, error: 'Email service not configured' }
  }

  const content = `
    <h2 style="color: #1f2937;">🔐 Recuperação de Senha</h2>
    <p>Olá <strong>${name || 'cliente'}</strong>,</p>
    <p>Recebemos uma solicitação para redefinir a senha da sua conta no ${STORE_NAME}.</p>
    
    <p>Clique no botão abaixo para criar uma nova senha:</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="button">Redefinir Minha Senha</a>
    </p>
    
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ⚠️ <strong>Atenção:</strong> Este link é válido por <strong>1 hora</strong>. 
        Se você não solicitou a redefinição de senha, ignore este email.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
    </p>
    <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #4b5563;">
      ${resetLink}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px;">
      Por questões de segurança, nunca compartilhe este link com ninguém.
    </p>
  `

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🔐 Redefinir senha - ${STORE_NAME}`,
      html: baseTemplate(content)
    })

    if (error) {
      console.error('[Email] Error sending password reset:', error)
      return { success: false, error: error.message }
    }

    console.log('[Email] Password reset sent:', emailData?.id)
    return { success: true, id: emailData?.id }
  } catch (error: any) {
    console.error('[Email] Error:', error)
    return { success: false, error: error.message }
  }
}

