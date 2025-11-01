import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Carrito } from './schemas/carrito.schema';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class CarritoService {
  constructor(
    @InjectModel(Carrito.name) private carritoModel: Model<Carrito>,
    private productosService: ProductosService,
  ) {}

  async obtenerCarrito(usuarioId: string): Promise<Carrito> {
    let carrito = await this.carritoModel.findOne({ usuarioId }).exec();

    if (!carrito) {
      carrito = new this.carritoModel({ usuarioId, items: [] });
      await carrito.save();
    }

    return carrito;
  }

  async agregarItem(
    usuarioId: string,
    productoId: string,
    cantidad: number,
  ): Promise<Carrito> {
    const producto = await this.productosService.findOne(productoId);
    const carrito = await this.obtenerCarrito(usuarioId);

    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.items.find(
      (item) => item.productoId.toString() === productoId,
    );

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
    } else {
      carrito.items.push({
        productoId: producto._id as any,
        cantidad,
        precioUnitario: producto.precio,
      });
    }

    return this.calcularTotales(carrito);
  }

  async actualizarCantidad(
    usuarioId: string,
    productoId: string,
    cantidad: number,
  ): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuarioId);

    const item = carrito.items.find(
      (i) => i.productoId.toString() === productoId,
    );

    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    item.cantidad = cantidad;

    return this.calcularTotales(carrito);
  }

  async eliminarItem(usuarioId: string, productoId: string): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuarioId);

    carrito.items = carrito.items.filter(
      (item) => item.productoId.toString() !== productoId,
    );

    return this.calcularTotales(carrito);
  }

  async vaciarCarrito(usuarioId: string): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuarioId);
    carrito.items = [];
    return this.calcularTotales(carrito);
  }

  private async calcularTotales(carrito: Carrito): Promise<Carrito> {
    carrito.subtotal = carrito.items.reduce(
      (sum, item) => sum + item.precioUnitario * item.cantidad,
      0,
    );

    carrito.iva = Math.round(carrito.subtotal * 0.19); // 19% IVA Chile
    carrito.total = carrito.subtotal + carrito.iva;

    return carrito.save();
  }
}
