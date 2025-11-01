import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo pedido desde el carrito' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  crear(
    @Body() body: { usuarioId: string; direccionId: string; metodoPago: string },
  ) {
    return this.pedidosService.crear(body.usuarioId, body.direccionId, body.metodoPago);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial de pedidos del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos' })
  obtenerPedidos(@Query('usuarioId') usuarioId: string) {
    return this.pedidosService.obtenerPedidos(usuarioId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un pedido' })
  @ApiResponse({ status: 200, description: 'Detalle del pedido' })
  obtenerPedido(@Param('id') id: string) {
    return this.pedidosService.obtenerPedido(id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado del pedido (Admin)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  actualizarEstado(@Param('id') id: string, @Body() body: { estado: string }) {
    return this.pedidosService.actualizarEstado(id, body.estado);
  }
}
