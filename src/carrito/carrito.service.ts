import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Carrito } from './schemas/carrito.schema';
import { ItemCarrito } from './schemas/item-carrito.schema';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class CarritoService {
  constructor(
    @InjectModel(Carrito.name) private carritoModel: Model<Carrito>,
    @InjectModel(ItemCarrito.name) private itemCarritoModel: Model<ItemCarrito>,
    private productosService: ProductosService,
  ) {}

  async obtenerCarrito(usuarioId: string): Promise<Carrito> {
    let carrito = await this.carritoModel.findOne({ usuarioId }).exec();

    if (!carrito) {
      carrito = new this.carritoModel({ usuarioId });
      await carrito.save();
    }

    return carrito;
  }

  async obtenerItemsCarrito(carritoId: string): Promise<ItemCarrito[]> {
    return this.itemCarritoModel
      .find({ carritoId })
      .populate('productoId', 'nombre precio categoria imagen')
      .exec();
  }

  async obtenerCarritoConItems(usuarioId: string): Promise<any> {
    const carrito = await this.obtenerCarrito(usuarioId);
    const items = await this.obtenerItemsCarrito(carrito._id.toString());

    return {
      ...carrito.toObject(),
      items,
    };
  }

  async agregarItem(
    usuarioId: string,
    productoId: string,
    cantidad: number,
  ): Promise<Carrito> {
    const producto = await this.productosService.findOne(productoId);
    const carrito = await this.obtenerCarrito(usuarioId);

    // Verificar si el item ya existe
    const itemExistente = await this.itemCarritoModel.findOne({
      carritoId: carrito._id,
      productoId,
    });

    if (itemExistente) {
      // Actualizar cantidad del item existente
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.precioUnitario * itemExistente.cantidad;
      await itemExistente.save();
    } else {
      // Crear nuevo item
      const nuevoItem = new this.itemCarritoModel({
        carritoId: carrito._id,
        productoId: producto._id,
        cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * cantidad,
      });
      await nuevoItem.save();
    }

    return this.recalcularTotales(carrito._id.toString());
  }

  async actualizarCantidad(
    usuarioId: string,
    productoId: string,
    cantidad: number,
  ): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuarioId);

    const item = await this.itemCarritoModel.findOne({
      carritoId: carrito._id,
      productoId,
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    if (cantidad <= 0) {
      // Si la cantidad es 0 o negativa, eliminar el item
      await this.itemCarritoModel.deleteOne({ _id: item._id });
    } else {
      // Actualizar cantidad
      item.cantidad = cantidad;
      item.subtotal = item.precioUnitario * cantidad;
      await item.save();
    }

    return this.recalcularTotales(carrito._id.toString());
  }

  async eliminarItem(usuarioId: string, productoId: string): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuarioId);

    const resultado = await this.itemCarritoModel.deleteOne({
      carritoId: carrito._id,
      productoId,
    });

    if (resultado.deletedCount === 0) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    return this.recalcularTotales(carrito._id.toString());
  }

  async vaciarCarrito(usuarioId: string): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuarioId);

    // Eliminar todos los items del carrito
    await this.itemCarritoModel.deleteMany({ carritoId: carrito._id });

    return this.recalcularTotales(carrito._id.toString());
  }

  private async recalcularTotales(carritoId: string): Promise<Carrito> {
    const carrito = await this.carritoModel.findById(carritoId);

    if (!carrito) {
      throw new NotFoundException('Carrito no encontrado');
    }

    // Obtener todos los items del carrito
    const items = await this.itemCarritoModel.find({ carritoId });

    // Calcular totales
    carrito.subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    carrito.iva = Math.round(carrito.subtotal * 0.19); // 19% IVA Chile
    carrito.total = carrito.subtotal + carrito.iva;
    carrito.cantidadItems = items.length;

    return carrito.save();
  }
}

