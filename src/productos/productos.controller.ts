import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@ApiTags('productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto (Admin)' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos con filtros opcionales' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['IPA', 'Stout', 'Lager', 'Porter', 'Ale'] })
  @ApiQuery({ name: 'precioMin', required: false, type: Number })
  @ApiQuery({ name: 'precioMax', required: false, type: Number })
  @ApiQuery({ name: 'abvMin', required: false, type: Number })
  @ApiQuery({ name: 'abvMax', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  findAll(
    @Query('tipo') tipo?: string,
    @Query('precioMin') precioMin?: number,
    @Query('precioMax') precioMax?: number,
    @Query('abvMin') abvMin?: number,
    @Query('abvMax') abvMax?: number,
  ) {
    return this.productosService.findAll({
      tipo,
      precioMin: precioMin ? Number(precioMin) : undefined,
      precioMax: precioMax ? Number(precioMax) : undefined,
      abvMin: abvMin ? Number(abvMin) : undefined,
      abvMax: abvMax ? Number(abvMax) : undefined,
    });
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar productos por nombre o descripción' })
  @ApiQuery({ name: 'q', required: true, description: 'Término de búsqueda' })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda' })
  buscar(@Query('q') termino: string) {
    return this.productosService.buscar(termino);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un producto' })
  @ApiResponse({ status: 200, description: 'Detalle del producto' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto (Admin)' })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto (Admin)' })
  @ApiResponse({ status: 200, description: 'Producto eliminado (soft delete)' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
