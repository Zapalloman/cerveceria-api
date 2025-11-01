import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pago } from './schemas/pago.schema';

@Injectable()
export class PagosService {
  constructor(@InjectModel(Pago.name) private pagoModel: Model<Pago>) {}

  async simularPago(
    pedidoId: string,
    metodo: string,
    monto: number,
  ): Promise<Pago> {
    // Simular procesamiento de pago (siempre aprobado en desarrollo)
    const numeroComprobante = `PAY-${Date.now()}`;

    const pago = new this.pagoModel({
      pedidoId,
      metodo,
      monto,
      estado: 'Aprobado', // Simulado - siempre aprobado
      numeroComprobante,
      detalles: 'Pago simulado - Desarrollo',
    });

    return pago.save();
  }

  async obtenerPagoPorPedido(pedidoId: string): Promise<Pago> {
    return this.pagoModel.findOne({ pedidoId }).exec();
  }
}
