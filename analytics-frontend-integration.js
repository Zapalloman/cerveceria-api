/**
 * EJEMPLOS DE INTEGRACIÓN FRONTEND - ANALYTICS MODULE
 * Cervecería Craft Beer - E-commerce Analytics
 */

// ==================== CONFIGURACIÓN INICIAL ====================

const API_BASE_URL = 'http://localhost:3000/analytics';

// Headers comunes (ajustar según tu implementación de Auth)
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// ==================== 1. REGISTRAR EVENTOS ====================

/**
 * Registrar cuando un usuario ve un producto
 */
async function registrarVistaProducto(productoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/eventos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        tipoEvento: 'PRODUCTO_VISTO',
        entidad: 'Producto',
        entidadId: productoId,
        accion: 'Ver detalle',
        datosAdicionales: {
          referencia: window.location.pathname,
          timestamp: new Date().toISOString(),
        },
        dispositivo: detectarDispositivo(),
        navegador: detectarNavegador(),
        sesionId: obtenerSesionId(),
      }),
    });

    const data = await response.json();
    console.log('Evento registrado:', data);
  } catch (error) {
    console.error('Error al registrar evento:', error);
  }
}

/**
 * Registrar cuando un usuario agrega un producto al carrito
 */
async function registrarAgregarCarrito(productoId, cantidad, precio) {
  await fetch(`${API_BASE_URL}/eventos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      tipoEvento: 'PRODUCTO_AGREGADO_CARRITO',
      entidad: 'Producto',
      entidadId: productoId,
      accion: 'Agregar al carrito',
      datosAdicionales: {
        cantidad,
        precio,
        subtotal: cantidad * precio,
      },
      dispositivo: detectarDispositivo(),
      navegador: detectarNavegador(),
      sesionId: obtenerSesionId(),
    }),
  });
}

/**
 * Registrar búsqueda de productos
 */
async function registrarBusqueda(terminoBusqueda, resultados) {
  await fetch(`${API_BASE_URL}/eventos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      tipoEvento: 'BUSQUEDA_REALIZADA',
      entidad: 'Ninguno',
      accion: 'Búsqueda',
      datosAdicionales: {
        termino: terminoBusqueda,
        totalResultados: resultados.length,
        resultadosIds: resultados.slice(0, 5).map((r) => r._id),
      },
      dispositivo: detectarDispositivo(),
      navegador: detectarNavegador(),
      sesionId: obtenerSesionId(),
    }),
  });
}

/**
 * Registrar compra exitosa
 */
async function registrarCompra(pedidoId, total, items) {
  await fetch(`${API_BASE_URL}/eventos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      tipoEvento: 'COMPRA_REALIZADA',
      entidad: 'Pedido',
      entidadId: pedidoId,
      accion: 'Compra completada',
      datosAdicionales: {
        total,
        cantidadItems: items.length,
        productos: items.map((i) => i.productoId),
        metodoPago: 'FLOW',
      },
      dispositivo: detectarDispositivo(),
      navegador: detectarNavegador(),
      sesionId: obtenerSesionId(),
    }),
  });
}

// ==================== 2. REGISTRAR ABANDONO DE CARRITO ====================

/**
 * Registrar carrito abandonado (ejecutar cuando usuario cierra tab o después de inactividad)
 */
async function registrarCarritoAbandonado(carritoId, etapa, motivo = null) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/carritos-abandonados/${carritoId}`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          etapaAbandono: etapa, // 'CARRITO' | 'CHECKOUT' | 'PAGO'
          motivoAbandono: motivo, // 'PRECIO_ALTO' | 'COSTO_ENVIO' | etc.
          dispositivoUsado: detectarDispositivo(),
          navegador: detectarNavegador(),
          metadatos: {
            url: window.location.href,
            tiempoEnPagina: calcularTiempoEnPagina(),
          },
        }),
      }
    );

    const data = await response.json();
    console.log('Carrito abandonado registrado:', data);
  } catch (error) {
    console.error('Error al registrar abandono:', error);
  }
}

/**
 * Detectar abandono automático usando beforeunload
 */
window.addEventListener('beforeunload', function (e) {
  const carritoActivo = localStorage.getItem('carritoId');
  const enCheckout = window.location.pathname.includes('checkout');
  const enPago = window.location.pathname.includes('pago');

  if (carritoActivo && !sessionStorage.getItem('compraFinalizada')) {
    let etapa = 'Carrito';
    if (enPago) etapa = 'Pago';
    else if (enCheckout) etapa = 'Checkout';

    // Usar sendBeacon para envío garantizado
    navigator.sendBeacon(
      `${API_BASE_URL}/carritos-abandonados/${carritoActivo}`,
      JSON.stringify({
        etapaAbandono: etapa,
        motivoAbandono: 'Desconocido',
        dispositivoUsado: detectarDispositivo(),
        navegador: detectarNavegador(),
      })
    );
  }
});

/**
 * Modal de encuesta al abandonar checkout
 */
function mostrarEncuestaAbandono() {
  const motivos = [
    { value: 'PrecioAlto', label: 'El precio es muy alto' },
    { value: 'CostoEnvio', label: 'El costo de envío es elevado' },
    { value: 'ProcesoComplicado', label: 'El proceso es muy complicado' },
    { value: 'FaltaMetodoPago', label: 'No está mi método de pago' },
    { value: 'SoloExplorando', label: 'Solo estaba mirando' },
  ];

  // Mostrar modal con opciones
  const motivoSeleccionado = prompt(
    '¿Por qué no finalizaste tu compra?\n' +
      motivos.map((m, i) => `${i + 1}. ${m.label}`).join('\n')
  );

  if (motivoSeleccionado) {
    const motivo = motivos[parseInt(motivoSeleccionado) - 1];
    if (motivo) {
      registrarCarritoAbandonado(
        localStorage.getItem('carritoId'),
        'Checkout',
        motivo.value
      );
    }
  }
}

// ==================== 3. OBTENER ESTADÍSTICAS (ADMIN) ====================

/**
 * Obtener productos más vendidos
 */
async function obtenerProductosMasVendidos(limite = 10) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/productos/mas-vendidos?limite=${limite}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const data = await response.json();
    return data.productos;
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    return [];
  }
}

/**
 * Obtener estadísticas de carritos abandonados
 */
async function obtenerEstadisticasAbandono() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/carritos-abandonados/estadisticas`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
}

/**
 * Obtener dashboard completo
 */
async function obtenerDashboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    return null;
  }
}

/**
 * Obtener insights y recomendaciones
 */
async function obtenerInsights() {
  try {
    const response = await fetch(`${API_BASE_URL}/insights`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener insights:', error);
    return null;
  }
}

// ==================== 4. GENERAR REPORTES ====================

/**
 * Generar reporte mensual
 */
async function generarReporteMensual(mes, año) {
  const fechaInicio = new Date(año, mes - 1, 1).toISOString();
  const fechaFin = new Date(año, mes, 0, 23, 59, 59).toISOString();

  try {
    const response = await fetch(`${API_BASE_URL}/reportes/generar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        periodo: 'MENSUAL',
        fechaInicio,
        fechaFin,
      }),
    });

    const data = await response.json();
    return data.reporte;
  } catch (error) {
    console.error('Error al generar reporte:', error);
    return null;
  }
}

/**
 * Comparar dos meses
 */
async function compararMeses(mes1, año1, mes2, año2) {
  const periodo1 = {
    inicio: new Date(año1, mes1 - 1, 1).toISOString(),
    fin: new Date(año1, mes1, 0, 23, 59, 59).toISOString(),
  };

  const periodo2 = {
    inicio: new Date(año2, mes2 - 1, 1).toISOString(),
    fin: new Date(año2, mes2, 0, 23, 59, 59).toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/reportes/comparar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ periodo1, periodo2 }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al comparar periodos:', error);
    return null;
  }
}

// ==================== 5. VISUALIZACIÓN DE DATOS ====================

/**
 * Renderizar dashboard de administrador
 */
async function renderizarDashboardAdmin() {
  const dashboardData = await obtenerDashboard();
  const insights = await obtenerInsights();

  if (!dashboardData || !insights) {
    console.error('No se pudieron cargar los datos del dashboard');
    return;
  }

  // Productos más vendidos
  const topProductosHTML = dashboardData.productosMasVendidos
    .map(
      (p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.productoId?.nombre || 'N/A'}</td>
      <td>${p.totalVentas}</td>
      <td>$${p.ingresoTotal?.toLocaleString()}</td>
      <td>${p.tasaConversion?.toFixed(2)}%</td>
    </tr>
  `
    )
    .join('');

  document.getElementById('top-productos').innerHTML = topProductosHTML;

  // Estadísticas de abandono
  const abandonoHTML = `
    <div class="card">
      <h3>Carritos Abandonados: ${
        dashboardData.estadisticasAbandono.totalAbandonados
      }</h3>
      <p>Valor Total Perdido: $${dashboardData.estadisticasAbandono.valorPerdido.totalPerdido?.toLocaleString()}</p>
      <h4>Por Motivo:</h4>
      <ul>
        ${dashboardData.estadisticasAbandono.porMotivo
          .map(
            (m) => `
          <li>${m._id}: ${m.cantidad} carritos (Promedio: $${m.promedioTotal?.toLocaleString()})</li>
        `
          )
          .join('')}
      </ul>
    </div>
  `;

  document.getElementById('abandono-stats').innerHTML = abandonoHTML;

  // Recomendaciones
  const recomendacionesHTML = insights.recomendaciones
    .map((r) => `<li class="alert alert-info">${r}</li>`)
    .join('');

  document.getElementById('recomendaciones').innerHTML = recomendacionesHTML;
}

/**
 * Crear gráfico de productos más vendidos (usando Chart.js)
 */
async function crearGraficoProductos() {
  const productos = await obtenerProductosMasVendidos(5);

  const ctx = document.getElementById('chartProductos').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: productos.map((p) => p.productoId?.nombre || 'N/A'),
      datasets: [
        {
          label: 'Ventas',
          data: productos.map((p) => p.totalVentas),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Top 5 Productos Más Vendidos',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

/**
 * Crear gráfico de motivos de abandono (usando Chart.js)
 */
async function crearGraficoAbandono() {
  const stats = await obtenerEstadisticasAbandono();

  const ctx = document.getElementById('chartAbandono').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: stats.porMotivo.map((m) => m._id),
      datasets: [
        {
          label: 'Carritos Abandonados',
          data: stats.porMotivo.map((m) => m.cantidad),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Motivos de Abandono de Carrito',
        },
      },
    },
  });
}

// ==================== UTILIDADES ====================

function detectarDispositivo() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

function detectarNavegador() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';
  return 'Desconocido';
}

function obtenerSesionId() {
  let sesionId = sessionStorage.getItem('analytics_session_id');
  if (!sesionId) {
    sesionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('analytics_session_id', sesionId);
  }
  return sesionId;
}

let tiempoInicialPagina = Date.now();
function calcularTiempoEnPagina() {
  return Math.floor((Date.now() - tiempoInicialPagina) / 1000); // en segundos
}

// ==================== EJEMPLO DE USO COMPLETO ====================

// Cuando el usuario visita una página de producto
document.addEventListener('DOMContentLoaded', () => {
  const productoId = document.querySelector('[data-producto-id]')?.dataset.productoId;
  
  if (productoId && window.location.pathname.includes('detalle')) {
    registrarVistaProducto(productoId);
  }
});

// Cuando agrega un producto al carrito
document.getElementById('btnAgregarCarrito')?.addEventListener('click', () => {
  const productoId = document.querySelector('[data-producto-id]').dataset.productoId;
  const cantidad = parseInt(document.getElementById('cantidad').value);
  const precio = parseFloat(document.querySelector('[data-precio]').dataset.precio);
  
  registrarAgregarCarrito(productoId, cantidad, precio);
  
  // Luego continuar con la lógica normal de agregar al carrito
});

// Cuando realiza una búsqueda
document.getElementById('formBusqueda')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const termino = document.getElementById('inputBusqueda').value;
  
  // Hacer la búsqueda
  const resultados = await buscarProductos(termino);
  
  // Registrar el evento
  registrarBusqueda(termino, resultados);
  
  // Mostrar resultados
});

// Cuando completa una compra
async function finalizarCompra(pedidoId, total, items) {
  // Registrar compra
  await registrarCompra(pedidoId, total, items);
  
  // Marcar como compra finalizada para no registrar abandono
  sessionStorage.setItem('compraFinalizada', 'true');
  
  // Limpiar carrito
  localStorage.removeItem('carritoId');
}

console.log('✅ Módulo de Analytics Frontend cargado correctamente');
