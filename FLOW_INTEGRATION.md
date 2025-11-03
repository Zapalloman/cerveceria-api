# 💳 Integración FLOW - Cervecería Craft & Beer

## 📋 Descripción

Este proyecto integra **FLOW** como pasarela de pagos real para procesar transacciones de manera segura y profesional.

## 🎯 ¿Por qué FLOW?

- ✅ **Pasarela chilena líder** - Ampliamente usada en Chile
- ✅ **Ambiente Sandbox gratuito** - Perfecto para desarrollo y testing
- ✅ **API REST simple** - Fácil de integrar
- ✅ **Múltiples métodos de pago** - Webpay, tarjetas, transferencias
- ✅ **Ideal para proyectos universitarios** - Funciona sin cuenta real

---

## 🚀 Configuración

### 1. Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```bash
# Modo Sandbox (desarrollo)
FLOW_SANDBOX=true
FLOW_API_KEY=DEMO_API_KEY
FLOW_SECRET_KEY=DEMO_SECRET_KEY

# URLs de la aplicación
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5500
```

### 2. Para Ambiente de Desarrollo/Testing

**No requiere cuenta real de FLOW**. El sistema funciona en modo simulado:

- `FLOW_SANDBOX=true` activa el modo de prueba
- Credenciales `DEMO_*` hacen que el servicio simule respuestas de FLOW
- Todas las transacciones se aprueban automáticamente
- No se cobran comisiones

### 3. Para Producción Real

1. Registrarse en [FLOW](https://www.flow.cl/)
2. Obtener credenciales del panel de FLOW
3. Configurar:
   ```bash
   FLOW_SANDBOX=false
   FLOW_API_KEY=tu_api_key_real
   FLOW_SECRET_KEY=tu_secret_key_real
   ```

---

## 📡 API Endpoints

### Crear Pago

```http
POST /api/pagos/flow/crear
Content-Type: application/json

{
  "pedidoId": "64abc123...",
  "numeroOrden": "ORD-1699123456789",
  "monto": 17600,
  "email": "cliente@ejemplo.cl"
}
```

**Respuesta:**
```json
{
  "success": true,
  "pagoId": "64xyz789...",
  "flowUrl": "https://sandbox.flow.cl/api/payment/pay?token=FLOW_TOKEN_...",
  "token": "FLOW_TOKEN_1699123456789_abc123",
  "message": "Redirigir al usuario a flowUrl para completar el pago"
}
```

### Confirmar Pago (Webhook)

```http
GET /api/pagos/flow/confirm?token=FLOW_TOKEN_...
```

**Respuesta:**
```json
{
  "success": true,
  "estado": "Pagado",
  "pagoId": "64xyz789...",
  "pedidoId": "64abc123..."
}
```

### Consultar Estado

```http
GET /api/pagos/estado/:pagoId
```

**Respuesta:**
```json
{
  "pago": {
    "_id": "64xyz789...",
    "estado": "Pagado",
    "monto": 17600,
    "flowToken": "FLOW_TOKEN_...",
    "flowUrl": "https://...",
    "numeroComprobante": "FLOW-1699123456789"
  },
  "flowStatus": {
    "status": 2,
    "amount": 17600,
    "paymentData": { ... }
  }
}
```

---

## 🔄 Flujo de Pago

```
1. Usuario completa checkout
   ↓
2. Frontend → POST /api/pagos/flow/crear
   ↓
3. Backend crea pago en BD y FLOW
   ↓
4. Backend retorna flowUrl
   ↓
5. Frontend redirige a flowUrl (página de FLOW)
   ↓
6. Usuario paga en FLOW
   ↓
7. FLOW llama webhook → GET /api/pagos/flow/confirm
   ↓
8. Backend actualiza estado del pago
   ↓
9. FLOW redirige → GET /api/pagos/flow/return
   ↓
10. Backend redirige a frontend con resultado
```

---

## 🗂️ Estructura de Archivos

```
backend/src/pagos/
├── flow/
│   └── flow.service.ts          # Servicio de integración FLOW
├── schemas/
│   └── pago.schema.ts           # Schema con campos FLOW
├── pagos.controller.ts          # Endpoints de pagos
├── pagos.service.ts             # Lógica de negocio
└── pagos.module.ts              # Módulo NestJS
```

---

## 🧪 Testing

### Modo Sandbox (Automático)

En desarrollo, todos los pagos se simulan exitosamente:

```typescript
// Crear pago de prueba
const pago = await pagosService.crearPagoFlow(
  pedidoId,
  'ORD-123',
  10000,
  'test@test.cl'
);

// El estado siempre será "Pagado" en sandbox
console.log(pago.estado); // "Pagado"
```

### Testing Manual

1. Iniciar servidor: `npm run start:dev`
2. Usar Postman/Thunder Client
3. Crear pago con endpoint `POST /api/pagos/flow/crear`
4. Visitar la `flowUrl` retornada
5. En sandbox, aparecerá página de pago simulada

---

## 📊 Estados de Pago

| Estado     | Descripción                     |
|------------|---------------------------------|
| Pendiente  | Pago creado, esperando usuario  |
| Pagado     | Pago confirmado exitosamente    |
| Rechazado  | Pago rechazado por pasarela     |
| Cancelado  | Usuario canceló el pago         |

---

## 🔐 Seguridad

### Firma de Transacciones

Todas las peticiones a FLOW se firman con HMAC-SHA256:

```typescript
// Generación de firma
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(paramsOrdenados)
  .digest('hex');
```

### Verificación de Webhooks

```typescript
// Verificar que el webhook viene de FLOW
const isValid = flowService.verifyWebhookSignature(
  params,
  receivedSignature
);
```

---

## 📚 Documentación FLOW

- **Documentación oficial**: [https://www.flow.cl/docs/](https://www.flow.cl/docs/)
- **Sandbox**: [https://sandbox.flow.cl/](https://sandbox.flow.cl/)
- **API Reference**: [https://www.flow.cl/docs/api.html](https://www.flow.cl/docs/api.html)

---

## 🎓 Para Proyecto Universitario

Este setup está optimizado para proyectos académicos:

- ✅ **No requiere cuenta bancaria**
- ✅ **Sin costos de transacción**
- ✅ **Totalmente funcional en local**
- ✅ **Simula flujo real de pagos**
- ✅ **Código profesional y bien documentado**

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'crypto'"

```bash
npm install --save-dev @types/node
```

### Pagos no se confirman

1. Verificar `FLOW_SANDBOX=true` en `.env`
2. Revisar logs del servidor
3. Verificar que MongoDB esté corriendo

### URL de retorno no funciona

1. Verificar `FRONTEND_URL` en `.env`
2. Asegurarse que el frontend esté corriendo en ese puerto

---

## 📝 Changelog

### v1.0.0 - Integración FLOW

- ✅ Schema de pagos actualizado con campos FLOW
- ✅ FlowService para manejo de API
- ✅ Endpoints de creación y confirmación
- ✅ Webhooks configurados
- ✅ Modo sandbox para desarrollo
- ✅ Documentación completa

---

## 👨‍💻 Desarrollado por

**Proyecto Universitario - Cervecería Craft & Beer**

Para más información, ver README principal del proyecto.
