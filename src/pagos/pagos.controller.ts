import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagosService } from './pagos.service';

@ApiTags('pagos')
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('simular')
  @ApiOperation({ summary: 'Simular procesamiento de pago' })
  @ApiResponse({ status: 201, description: 'Pago simulado exitosamente' })
  simularPago(
    @Body() body: { pedidoId: string; metodo: string; monto: number },
  ) {
    return this.pagosService.simularPago(body.pedidoId, body.metodo, body.monto);
  }

  @Get('pedido/:pedidoId')
  @ApiOperation({ summary: 'Obtener información de pago de un pedido' })
  @ApiResponse({ status: 200, description: 'Información del pago' })
  obtenerPagoPorPedido(@Param('pedidoId') pedidoId: string) {
    return this.pagosService.obtenerPagoPorPedido(pedidoId);
  }
}
