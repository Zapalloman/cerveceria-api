// ================================================================
// SCRIPT DE PRUEBA - INTEGRACIÓN FLOW
// ================================================================
// Este script simula el flujo completo de pago con FLOW
// Para ejecutar: node test-flow.js (requiere backend corriendo)
// ================================================================

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  log('\n' + '='.repeat(60), 'cyan');
}

async function testFlowIntegration() {
  try {
    separator();
    log('🧪 TEST DE INTEGRACIÓN FLOW - CERVECERÍA CRAFT & BEER', 'cyan');
    separator();

    // ============================================================
    // PASO 1: Crear un pago
    // ============================================================
    log('\n📝 PASO 1: Creando pago con FLOW...', 'blue');
    
    const pagoData = {
      pedidoId: '64abc123def456789',
      numeroOrden: `ORD-${Date.now()}`,
      monto: 17600,
      email: 'cliente@test.cl'
    };

    log(`   Datos del pago:`, 'yellow');
    log(`   - Pedido ID: ${pagoData.pedidoId}`);
    log(`   - Orden: ${pagoData.numeroOrden}`);
    log(`   - Monto: $${pagoData.monto} CLP`);
    log(`   - Email: ${pagoData.email}`);

    const crearResponse = await axios.post(
      `${API_URL}/pagos/flow/crear`,
      pagoData
    );

    if (crearResponse.data.success) {
      log('\n✅ Pago creado exitosamente!', 'green');
      log(`   Pago ID: ${crearResponse.data.pagoId}`);
      log(`   Token: ${crearResponse.data.token}`);
      log(`   URL FLOW: ${crearResponse.data.flowUrl}`, 'cyan');
    } else {
      throw new Error('Error al crear pago');
    }

    const { token, pagoId } = crearResponse.data;

    // ============================================================
    // PASO 2: Simular webhook de confirmación (como si FLOW confirmara)
    // ============================================================
    separator();
    log('\n🔔 PASO 2: Simulando confirmación de FLOW (webhook)...', 'blue');
    log('   En producción, FLOW llamaría este endpoint automáticamente');

    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s para simular procesamiento

    const confirmarResponse = await axios.get(
      `${API_URL}/pagos/flow/confirm?token=${token}`
    );

    if (confirmarResponse.data.success) {
      log('\n✅ Pago confirmado exitosamente!', 'green');
      log(`   Estado: ${confirmarResponse.data.estado}`);
      log(`   Pago ID: ${confirmarResponse.data.pagoId}`);
      log(`   Pedido ID: ${confirmarResponse.data.pedidoId}`);
    } else {
      log('\n❌ Pago no confirmado', 'red');
      log(`   Estado: ${confirmarResponse.data.estado}`);
    }

    // ============================================================
    // PASO 3: Consultar estado del pago
    // ============================================================
    separator();
    log('\n🔍 PASO 3: Consultando estado actual del pago...', 'blue');

    const estadoResponse = await axios.get(
      `${API_URL}/pagos/estado/${pagoId}`
    );

    log('\n📊 Información completa del pago:', 'yellow');
    log(JSON.stringify(estadoResponse.data, null, 2));

    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    separator();
    log('\n🎉 TEST COMPLETADO EXITOSAMENTE!', 'green');
    separator();

    log('\n📋 RESUMEN:', 'cyan');
    log(`   ✅ Pago creado: ${pagoId}`);
    log(`   ✅ Estado: ${estadoResponse.data.pago.estado}`);
    log(`   ✅ Monto: $${estadoResponse.data.pago.monto} CLP`);
    log(`   ✅ Método: ${estadoResponse.data.pago.metodo}`);
    log(`   ✅ Token FLOW: ${estadoResponse.data.pago.flowToken}`);

    separator();
    log('\n💡 NOTAS:', 'yellow');
    log('   - Este test usa el modo SANDBOX de FLOW');
    log('   - Todos los pagos se aprueban automáticamente');
    log('   - No se hacen cargos reales');
    log('   - Ideal para desarrollo y testing universitario');
    separator();

  } catch (error) {
    separator();
    log('\n❌ ERROR EN EL TEST', 'red');
    separator();
    
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else if (error.request) {
      log('   El servidor no está respondiendo.', 'red');
      log('   ¿Está corriendo el backend en http://localhost:3000?', 'yellow');
    } else {
      log(`   ${error.message}`, 'red');
    }
    
    separator();
    process.exit(1);
  }
}

// Ejecutar el test
log('\n🚀 Iniciando test de integración FLOW...\n', 'cyan');
testFlowIntegration();
