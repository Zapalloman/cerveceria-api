# 📊 Módulo de Analytics - API Cervecería Craft Beer

## 📋 Descripción General

El módulo de Analytics es un sistema **backend-to-backend** diseñado para rastrear el comportamiento de los usuarios, analizar carritos abandonados, identificar productos más vendidos y generar reportes de ventas detallados.

---

## 🏗️ Arquitectura

### Schemas Implementados

1. **CarritoAbandonado** - Registra carritos no finalizados
2. **EventoUsuario** - Rastrea todas las acciones del usuario
3. **EstadisticaProducto** - Métricas por producto
4. **ReporteVentas** - Reportes consolidados por periodo

### Enumeraciones

```typescript
// Tipos de Eventos
enum TipoEvento {
  PRODUCTO_VISTO
  PRODUCTO_AGREGADO_CARRITO
  PRODUCTO_REMOVIDO_CARRITO
  CARRITO_ABANDONADO
  COMPRA_REALIZADA
  BUSQUEDA_REALIZADA
  VALORACION_CREADA
  INICIO_SESION
  CIERRE_SESION
  REGISTRO_USUARIO
}

// Motivos de Abandono
enum MotivoAbandono {
  PRECIO_ALTO
  COSTO_ENVIO
  PROCESO_COMPLICADO
  FALTA_METODO_PAGO
  SOLO_EXPLORANDO
  DESCONOCIDO
}

// Etapas de Abandono
enum EtapaAbandono {
  CARRITO
  CHECKOUT
  PAGO
}
```

---

## 🚀 Endpoints Disponibles

### 📊 Eventos de Usuario

#### **POST** `/analytics/eventos`
Registra un evento de usuario (vista de producto, búsqueda, etc.)

**Body:**
```json
{
  "tipoEvento": "PRODUCTO_VISTO",
  "entidad": "Producto",
  "entidadId": "67890abcdef1234567890abc",
  "accion": "Ver detalle",
  "datosAdicionales": {
    "categoria": "IPA",
    "precio": 5990
  },
  "dispositivo": "Desktop",
  "navegador": "Chrome",
  "sesionId": "sess_123456"
}
```

**Response:**
```json
{
  "message": "Evento registrado exitosamente",
  "evento": { /* Objeto EventoUsuario */ }
}
```

---

#### **GET** `/analytics/eventos/usuario/:usuarioId`
Obtiene el historial de eventos de un usuario específico

**Query Params:**
- `limite` (opcional): Número máximo de eventos (default: 100)

**Response:**
```json
{
  "total": 42,
  "eventos": [ /* Array de eventos */ ]
}
```

---

#### **GET** `/analytics/eventos/tipo/:tipoEvento`
Obtiene eventos filtrados por tipo

**Params:**
- `tipoEvento`: PRODUCTO_VISTO | CARRITO_ABANDONADO | COMPRA_REALIZADA | etc.

**Query Params:**
- `fechaInicio` (opcional): ISO 8601 date
- `fechaFin` (opcional): ISO 8601 date

**Example:**
```
GET /analytics/eventos/tipo/PRODUCTO_VISTO?fechaInicio=2024-01-01&fechaFin=2024-01-31
```

---

#### **GET** `/analytics/eventos/resumen`
Resumen de todos los eventos agrupados por tipo

**Query Params:**
- `fechaInicio` (opcional)
- `fechaFin` (opcional)

**Response:**
```json
{
  "totalEventos": 1523,
  "porTipo": [
    { "_id": "PRODUCTO_VISTO", "cantidad": 856 },
    { "_id": "PRODUCTO_AGREGADO_CARRITO", "cantidad": 324 },
    { "_id": "CARRITO_ABANDONADO", "cantidad": 187 }
  ]
}
```

---

### 🛒 Carritos Abandonados

#### **POST** `/analytics/carritos-abandonados/:carritoId`
Registra un carrito como abandonado

**Params:**
- `carritoId`: ID del carrito

**Body:**
```json
{
  "etapaAbandono": "CHECKOUT",
  "motivoAbandono": "COSTO_ENVIO",
  "dispositivoUsado": "Mobile",
  "navegador": "Safari",
  "metadatos": {
    "tiempoEnCheckout": 120,
    "pasos completados": 2
  }
}
```

---

#### **GET** `/analytics/carritos-abandonados`
Lista de todos los carritos abandonados

**Query Params:**
- `fechaInicio` (opcional)
- `fechaFin` (opcional)

**Response:**
```json
{
  "total": 45,
  "carritos": [
    {
      "_id": "...",
      "usuarioId": { "nombre": "Juan Pérez", "email": "juan@example.com" },
      "items": [...],
      "total": 29950,
      "motivoAbandono": "PRECIO_ALTO",
      "etapaAbandono": "CARRITO",
      "fechaAbandono": "2024-11-03T10:30:00Z"
    }
  ]
}
```

---

#### **GET** `/analytics/carritos-abandonados/estadisticas`
Estadísticas completas de abandono

**Response:**
```json
{
  "totalAbandonados": 187,
  "porMotivo": [
    { "_id": "PRECIO_ALTO", "cantidad": 67, "promedioTotal": 35420 },
    { "_id": "COSTO_ENVIO", "cantidad": 45, "promedioTotal": 18990 },
    { "_id": "SOLO_EXPLORANDO", "cantidad": 38, "promedioTotal": 12500 }
  ],
  "porEtapa": [
    { "_id": "CARRITO", "cantidad": 89 },
    { "_id": "CHECKOUT", "cantidad": 62 },
    { "_id": "PAGO", "cantidad": 36 }
  ],
  "valorPerdido": {
    "totalPerdido": 4567890,
    "promedioPerdido": 24414
  }
}
```

---

#### **GET** `/analytics/carritos-abandonados/motivos`
Desglose detallado de motivos de abandono

---

### 📦 Estadísticas de Productos

#### **POST** `/analytics/productos/:productoId/calcular`
Calcula y actualiza estadísticas de un producto

**Params:**
- `productoId`: ID del producto

**Query Params:**
- `periodo`: Diario | Semanal | Mensual | Anual
- `fechaInicio`: ISO 8601 date
- `fechaFin`: ISO 8601 date

**Example:**
```
POST /analytics/productos/67890abc/calcular?periodo=Mensual&fechaInicio=2024-10-01&fechaFin=2024-10-31
```

---

#### **GET** `/analytics/productos/mas-vendidos`
Top productos más vendidos

**Query Params:**
- `limite` (opcional): default 10

**Response:**
```json
{
  "total": 10,
  "productos": [
    {
      "productoId": { "nombre": "IPA Hoppy", "precio": 5990, "categoria": "IPA" },
      "totalVentas": 245,
      "totalVistas": 1823,
      "tasaConversion": 13.45,
      "ingresoTotal": 1467550
    }
  ]
}
```

---

#### **GET** `/analytics/productos/menos-vendidos`
Productos con menor rotación

**Query Params:**
- `limite` (opcional): default 10

---

#### **GET** `/analytics/productos/tendencias`
Tendencias de productos en un periodo

**Query Params:**
- `fechaInicio` (requerido)
- `fechaFin` (requerido)

**Response:**
Productos ordenados por tasa de conversión

---

### 📈 Reportes de Ventas

#### **POST** `/analytics/reportes/generar`
Genera un nuevo reporte de ventas

**Body:**
```json
{
  "periodo": "MENSUAL",
  "fechaInicio": "2024-10-01",
  "fechaFin": "2024-10-31"
}
```

**Periodos disponibles:**
- `DIARIO` - Día actual
- `SEMANAL` - Últimos 7 días
- `MENSUAL` - Último mes
- `TRIMESTRAL` - Últimos 3 meses
- `ANUAL` - Último año
- `PERSONALIZADO` - Requiere fechaInicio y fechaFin

---

#### **GET** `/analytics/reportes/periodo/:periodo`
Obtiene el reporte más reciente de un periodo

**Params:**
- `periodo`: DIARIO | SEMANAL | MENSUAL | etc.

**Query Params (opcional):**
- `fechaInicio`
- `fechaFin`

**Response:**
```json
{
  "reporte": {
    "periodo": "MENSUAL",
    "fechaInicio": "2024-10-01T00:00:00Z",
    "fechaFin": "2024-10-31T23:59:59Z",
    "totalVentas": 342,
    "totalIngresos": 8567890,
    "ticketPromedio": 25053,
    "totalClientes": 278,
    "clientesNuevos": 89,
    "clientesRecurrentes": 189,
    "productosMasVendidos": [...],
    "categoriasMasVendidas": [...],
    "totalCarritosAbandonados": 187,
    "tasaAbandonoCarrito": 35.4,
    "tasaConversionGeneral": 18.7
  }
}
```

---

#### **POST** `/analytics/reportes/comparar`
Compara dos periodos

**Body:**
```json
{
  "periodo1": {
    "inicio": "2024-10-01",
    "fin": "2024-10-31"
  },
  "periodo2": {
    "inicio": "2024-09-01",
    "fin": "2024-09-30"
  }
}
```

**Response:**
```json
{
  "periodo1": { /* Reporte completo */ },
  "periodo2": { /* Reporte completo */ },
  "comparacion": {
    "ventasDiferencia": 45,
    "ventasPorcentaje": 15.2,
    "ingresosDiferencia": 567890,
    "ingresosPorcentaje": 7.1
  }
}
```

---

### 💡 Insights y Dashboard

#### **GET** `/analytics/insights`
Insights y recomendaciones basadas en datos

**Response:**
```json
{
  "productosMasVendidos": [...],
  "estadisticasAbandono": {...},
  "resumenEventos": {...},
  "recomendaciones": [
    "Considerar implementar descuentos para reducir abandono por precio alto",
    "Ofrecer envío gratis en compras superiores a cierto monto",
    "Destacar los productos más vendidos en la página principal"
  ]
}
```

---

#### **GET** `/analytics/dashboard`
Dashboard completo con métricas de los últimos 30 días

**Response:**
Combinación de todos los insights, productos más vendidos, estadísticas de abandono y eventos.

---

## 🔧 Integración con Otros Módulos

### Ejemplo: Registrar evento cuando se ve un producto

En `productos.controller.ts`:

```typescript
import { AnalyticsService } from '../analytics/analytics.service';
import { TipoEvento, TipoEntidad } from '../analytics/schemas/evento-usuario.schema';

@Get(':id')
async obtenerProducto(@Param('id') id: string, @Request() req: any) {
  const producto = await this.productosService.findOne(id);
  
  // Registrar evento de vista
  await this.analyticsService.registrarEvento(
    req.user?.userId || null,
    {
      tipoEvento: TipoEvento.PRODUCTO_VISTO,
      entidad: TipoEntidad.PRODUCTO,
      entidadId: id,
      accion: 'Ver detalle producto',
      datosAdicionales: {
        categoria: producto.categoria,
        precio: producto.precio,
      }
    },
    req.ip,
    req.headers['user-agent']
  );
  
  return producto;
}
```

### Ejemplo: Registrar carrito abandonado

En `carrito.service.ts` o mediante un Cron Job:

```typescript
async verificarCarritosAbandonados() {
  // Buscar carritos sin actividad por más de 24 horas
  const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const carritosInactivos = await this.carritoModel.find({
    updatedAt: { $lt: hace24Horas },
    // Que no tengan un pedido asociado
  });
  
  for (const carrito of carritosInactivos) {
    await this.analyticsService.registrarCarritoAbandonado(
      carrito._id.toString(),
      carrito.usuarioId.toString(),
      {
        etapaAbandono: EtapaAbandono.CARRITO,
        motivoAbandono: MotivoAbandono.DESCONOCIDO,
      },
      carrito
    );
  }
}
```

---

## 📊 Índices de MongoDB

El módulo crea automáticamente los siguientes índices para optimizar consultas:

### CarritoAbandonado
- `usuarioId`
- `fechaAbandono` (descendente)
- `motivoAbandono`
- `etapaAbandono`

### EventoUsuario
- `usuarioId + fecha` (compuesto, descendente)
- `tipoEvento + fecha` (compuesto, descendente)
- `entidad + entidadId` (compuesto)
- `fecha` (descendente)
- `sesionId`

### EstadisticaProducto
- `productoId + periodo + fechaInicio` (compuesto)
- `periodo + fechaInicio` (compuesto)
- `totalVentas` (descendente)
- `tasaConversion` (descendente)
- `ingresoTotal` (descendente)

### ReporteVentas
- `periodo + fechaInicio` (compuesto)
- `fechaGeneracion` (descendente)

---

## 🎯 Casos de Uso

### 1. Identificar productos con alta tasa de abandono
```
GET /analytics/productos/tendencias?fechaInicio=2024-10-01&fechaFin=2024-10-31
```
Filtrar por `totalCarritoAbandonado` alto

### 2. Analizar por qué los usuarios abandonan
```
GET /analytics/carritos-abandonados/estadisticas
```
Revisar `porMotivo` para identificar problemas principales

### 3. Generar reporte mensual de ventas
```
POST /analytics/reportes/generar
{
  "periodo": "MENSUAL",
  "fechaInicio": "2024-10-01",
  "fechaFin": "2024-10-31"
}
```

### 4. Dashboard de administrador
```
GET /analytics/dashboard
```
Métricas consolidadas para visualización

---

## 🚀 Próximos Pasos

1. **Integrar eventos** en todos los módulos (Productos, Carrito, Pedidos, etc.)
2. **Crear Cron Jobs** para calcular estadísticas automáticamente
3. **Implementar frontend** para visualizar dashboards
4. **Añadir notificaciones** para carritos abandonados (emails de recuperación)
5. **Machine Learning** para predicciones de abandono

---

## 📝 Notas Importantes

- Los eventos se registran de forma **asíncrona** para no afectar el rendimiento
- Las estadísticas de productos deben **calcularse periódicamente** (Cron Job recomendado)
- Los reportes de ventas se generan **bajo demanda** o mediante programación
- Todos los endpoints pueden protegerse con **guards de autenticación** según necesidad

---

## 🔐 Seguridad

Recomendaciones:
- Proteger endpoints administrativos con **JwtAuthGuard**
- Implementar **Rate Limiting** en endpoints de registro de eventos
- Validar permisos de usuario para acceder a reportes
- Sanitizar datos de entrada en `datosAdicionales` y `metadatos`

---

**¡El módulo está listo para rastrear el comportamiento completo de tu e-commerce! 🎉**
