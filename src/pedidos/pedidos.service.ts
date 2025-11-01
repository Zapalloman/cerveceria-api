import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pedido } from './schemas/pedido.schema';
import { CarritoService } from '../carrito/carrito.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectModel(Pedido.name) private pedidoModel: Model<Pedido>,
    private carritoService: CarritoService,
  ) {}

  async crear(usuarioId: string, direccionId: string, metodoPago: string): Promise<Pedido> {
    const carrito = await this.carritoService.obtenerCarrito(usuarioId);

    if (!carrito.items || carrito.items.length === 0) {
      throw new Error('El carrito está vacío');
    }

    const numeroOrden = `ORD-${Date.now()}`;

    const items = carrito.items.map((item) => ({
      productoId: item.productoId,
      nombreProducto: 'Producto', // En producción, obtener del producto
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.precioUnitario * item.cantidad,
    }));

    const pedido = new this.pedidoModel({
      numeroOrden,
      usuarioId,
      direccionId,
      items,
      subtotal: carrito.subtotal,
      iva: carrito.iva,
      total: carrito.total,
      metodoPago,
      estado: 'Procesando',
    });

    const pedidoGuardado = await pedido.save();

    // Vaciar carrito
    await this.carritoService.vaciarCarrito(usuarioId);

    return pedidoGuardado;
  }

  async obtenerPedidos(usuarioId: string): Promise<Pedido[]> {
    return this.pedidoModel
      .find({ usuarioId })
      .sort({ fechaPedido: -1 })
      .exec();
  }

  async obtenerPedido(id: string): Promise<Pedido> {
    return this.pedidoModel.findById(id).exec();
  }

  async actualizarEstado(id: string, estado: string): Promise<Pedido> {
    return this.pedidoModel
      .findByIdAndUpdate(id, { estado }, { new: true })
      .exec();
  }
}
