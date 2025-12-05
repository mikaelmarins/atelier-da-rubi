# Dados de Teste - Pagamentos

Este arquivo será atualizado quando a integração com InfinitePay estiver configurada.

## InfinitePay
- Documentação: https://developers.infinitepay.io/
- Status: Aguardando configuração da API

## Configuração Necessária

No `.env.local`, adicione:
```env
INFINITEPAY_API_KEY=sua_api_key_aqui
INFINITEPAY_SECRET=seu_secret_aqui
```

## Funcionalidades a Implementar
- [ ] Pagamento via PIX
- [ ] Pagamento via Cartão de Crédito
- [ ] Webhook para confirmação de pagamento
- [ ] Split de pagamento (se disponível)
