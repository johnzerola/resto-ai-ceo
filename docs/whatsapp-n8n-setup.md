# WhatsApp + N8N Integration Setup

## Overview
Sistema completo de gestão financeira e estoque via WhatsApp usando Evolution API + N8N + Supabase Edge Functions.

## 🚀 Quick Start

### 1. Configure Secrets no Supabase
Acesse: https://supabase.com/dashboard/project/llndccqumkrblpgystom/settings/functions

Adicione estas variáveis:
```
OPENAI_API_KEY=sua_openai_key_aqui
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_evolution_key_aqui
```

### 2. Setup N8N Workflow

#### Webhook Trigger
```
URL: https://n8n.seusite.com/webhook/whatsapp-processor
Method: POST
Headers: 
  - X-Tenant-ID: {tenant_id}
  - X-Instance-ID: {instance_id}
```

#### Workflow Steps:
1. **Webhook Trigger** - Recebe dados da Evolution API
2. **Code Node** - Processa payload do WhatsApp
3. **HTTP Request** - Chama Edge Functions do Supabase
4. **Response** - Retorna confirmação

### 3. Evolution API Webhook Config
Configure no Evolution API para enviar webhooks para N8N:

```json
{
  "webhook": "https://n8n.seusite.com/webhook/whatsapp-processor",
  "webhookByEvents": true,
  "webhookBase64": false,
  "events": ["messages.upsert"]
}
```

## 📋 Comandos Disponíveis

### Transações Financeiras
- ✅ "Vendi R$ 100" → Registra receita
- ✅ "Gastei R$ 50 em marketing" → Registra despesa
- ✅ Suporta áudio com transcrição
- ✅ Suporta imagens com OCR

### Estoque
- ✅ "Comprei 5 mussarela" → Entrada de estoque
- ✅ "Usei 2 calabresa" → Saída de estoque
- ✅ Criação automática de itens
- ✅ Atualização de quantidades

## 🔧 N8N Workflow Template

```json
{
  "name": "WhatsApp Financial Manager",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-processor",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "jsCode": "// Processar payload do WhatsApp\nconst data = $input.first().json;\nconst headers = $input.first().headers;\n\n// Extrair dados da mensagem\nconst messageData = data.data;\nconst messageContent = {\n  text: messageData.message?.conversation || messageData.message?.extendedTextMessage?.text,\n  audio: messageData.message?.audioMessage?.url,\n  image: messageData.message?.imageMessage?.url,\n  phoneNumber: messageData.key?.remoteJid?.split('@')[0],\n  messageId: messageData.key?.id,\n  timestamp: new Date().toISOString()\n};\n\n// Headers multi-tenant\nconst tenantId = headers['x-tenant-id'];\nconst instanceId = headers['x-instance-id'];\n\nreturn {\n  messageContent,\n  tenantId,\n  instanceId,\n  isTransaction: messageContent.text && (messageContent.text.includes('vendi') || messageContent.text.includes('gastei')),\n  isInventory: messageContent.text && (messageContent.text.includes('comprei') || messageContent.text.includes('usei'))\n};"
      },
      "name": "Process WhatsApp Data",
      "type": "n8n-nodes-base.code",
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.isTransaction}}",
              "value2": true
            }
          ]
        }
      },
      "name": "Is Transaction?",
      "type": "n8n-nodes-base.if",
      "position": [680, 200]
    },
    {
      "parameters": {
        "url": "https://llndccqumkrblpgystom.supabase.co/functions/v1/transaction-recorded",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "httpMethod": "POST",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-tenant-id",
              "value": "={{$json.tenantId}}"
            },
            {
              "name": "x-instance-id",
              "value": "={{$json.instanceId}}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "text",
              "value": "={{$json.messageContent.text}}"
            },
            {
              "name": "audio", 
              "value": "={{$json.messageContent.audio}}"
            },
            {
              "name": "image",
              "value": "={{$json.messageContent.image}}"
            },
            {
              "name": "phoneNumber",
              "value": "={{$json.messageContent.phoneNumber}}"
            },
            {
              "name": "messageId",
              "value": "={{$json.messageContent.messageId}}"
            },
            {
              "name": "timestamp",
              "value": "={{$json.messageContent.timestamp}}"
            }
          ]
        }
      },
      "name": "Call Transaction API",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 100]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.isInventory}}",
              "value2": true
            }
          ]
        }
      },
      "name": "Is Inventory?",
      "type": "n8n-nodes-base.if",
      "position": [680, 400]
    },
    {
      "parameters": {
        "url": "https://llndccqumkrblpgystom.supabase.co/functions/v1/inventory-movement",
        "authentication": "genericCredentialType", 
        "genericAuthType": "httpHeaderAuth",
        "httpMethod": "POST",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-tenant-id",
              "value": "={{$json.tenantId}}"
            },
            {
              "name": "x-instance-id", 
              "value": "={{$json.instanceId}}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "text",
              "value": "={{$json.messageContent.text}}"
            },
            {
              "name": "audio",
              "value": "={{$json.messageContent.audio}}"
            },
            {
              "name": "image", 
              "value": "={{$json.messageContent.image}}"
            },
            {
              "name": "phoneNumber",
              "value": "={{$json.messageContent.phoneNumber}}"
            },
            {
              "name": "messageId",
              "value": "={{$json.messageContent.messageId}}"
            },
            {
              "name": "timestamp",
              "value": "={{$json.messageContent.timestamp}}"
            }
          ]
        }
      },
      "name": "Call Inventory API",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 500]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, message: \"Processed successfully\" } }}"
      },
      "name": "Success Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1120, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Process WhatsApp Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process WhatsApp Data": {
      "main": [
        [
          {
            "node": "Is Transaction?",
            "type": "main",
            "index": 0
          },
          {
            "node": "Is Inventory?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Is Transaction?": {
      "main": [
        [
          {
            "node": "Call Transaction API",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Is Inventory?": {
      "main": [
        [
          {
            "node": "Call Inventory API",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Call Transaction API": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Call Inventory API": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 🧪 Teste Manual

### 1. Testar Edge Functions
```bash
# Transação
curl -X POST https://llndccqumkrblpgystom.supabase.co/functions/v1/transaction-recorded \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test-tenant" \
  -H "x-instance-id: test-instance" \
  -d '{"text": "Vendi R$ 100", "phoneNumber": "5511999999999", "messageId": "test", "timestamp": "2024-01-01T00:00:00Z"}'

# Estoque  
curl -X POST https://llndccqumkrblpgystom.supabase.co/functions/v1/inventory-movement \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: test-tenant" \
  -H "x-instance-id: test-instance" \
  -d '{"text": "Comprei 5 mussarela", "phoneNumber": "5511999999999", "messageId": "test", "timestamp": "2024-01-01T00:00:00Z"}'

# Resposta WhatsApp
curl -X POST https://llndccqumkrblpgystom.supabase.co/functions/v1/whatsapp-response \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "5511999999999", "transactionType": "income", "amount": 100, "tenantId": "test", "instanceId": "test"}'
```

## 🎯 Status do Sistema

✅ **Implementado:**
- Edge Functions (transaction-recorded, inventory-movement, whatsapp-response)
- Parser de linguagem natural (português)
- Processamento de áudio (OpenAI Whisper)
- Processamento de imagem (OpenAI Vision)
- Multi-tenancy com headers
- Validação de assinatura
- Confirmações automáticas via WhatsApp
- Base de dados completa com RLS

🔧 **Para Configurar:**
- N8N Workflow (usar template acima)
- Evolution API webhook
- Secrets do OpenAI no Supabase

## 📞 Suporte

- Edge Functions: https://supabase.com/dashboard/project/llndccqumkrblpgystom/functions
- Logs: https://supabase.com/dashboard/project/llndccqumkrblpgystom/functions/transaction-recorded/logs
- Banco: https://supabase.com/dashboard/project/llndccqumkrblpgystom/editor