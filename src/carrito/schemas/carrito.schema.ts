import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class ItemCarrito {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Producto' })
  productoId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  cantidad: number;

  @Prop({ required: true, min: 0 })
  precioUnitario: number;
}

@Schema({ timestamps: true })
export class Carrito extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Usuario', unique: true })
  usuarioId: Types.ObjectId;

  @Prop({ type: [ItemCarrito], default: [] })
  items: ItemCarrito[];

  @Prop({ default: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  iva: number;

  @Prop({ default: 0 })
  total: number;
}

export const CarritoSchema = SchemaFactory.createForClass(Carrito);

// Índices
CarritoSchema.index({ usuarioId: 1 });
