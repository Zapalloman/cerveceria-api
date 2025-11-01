import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Pago extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Pedido' })
  pedidoId: Types.ObjectId;

  @Prop({ required: true, enum: ['Tarjeta', 'Transferencia'] })
  metodo: string;

  @Prop({ required: true, min: 0 })
  monto: number;

  @Prop({
    required: true,
    enum: ['Pendiente', 'Aprobado', 'Rechazado'],
    default: 'Pendiente',
  })
  estado: string;

  @Prop({ type: Date, default: Date.now })
  fecha: Date;

  @Prop({ required: true, unique: true })
  numeroComprobante: string;

  @Prop({ trim: true })
  detalles: string; // Información adicional del pago simulado
}

export const PagoSchema = SchemaFactory.createForClass(Pago);

// Índices
PagoSchema.index({ pedidoId: 1 });
PagoSchema.index({ numeroComprobante: 1 });
PagoSchema.index({ estado: 1 });
