import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Direccion extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Usuario' })
  usuarioId: Types.ObjectId;

  @Prop({ required: true, enum: ['Casa', 'Oficina', 'Otro'] })
  tipo: string;

  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  calle: string;

  @Prop({ required: true, trim: true })
  ciudad: string;

  @Prop({ required: true, trim: true })
  region: string;

  @Prop({ trim: true })
  codigoPostal: string;

  @Prop({ trim: true })
  telefono: string;

  @Prop({ default: false })
  esPredeterminada: boolean;
}

export const DireccionSchema = SchemaFactory.createForClass(Direccion);

// Índices
DireccionSchema.index({ usuarioId: 1 });
