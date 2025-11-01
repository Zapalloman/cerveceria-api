import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductosService } from '../productos/productos.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productosService = app.get(ProductosService);

  const productos = [
    {
      nombre: 'Golden Lager',
      tipo: 'Lager',
      descripcion: 'Cerveza rubia de fermentación baja, ligera y refrescante.',
      precio: 3500,
      abv: 4.8,
      ibu: 25,
      formato: '330ml',
      stock: 100,
      imagen: 'images/golden-lager.jpg',
      ingredientes: ['Agua', 'Malta de cebada', 'Lúpulo', 'Levadura'],
      temperatura: '4-6°C',
    },
    {
      nombre: 'Imperial Stout',
      tipo: 'Stout',
      descripcion: 'Cerveza negra con notas intensas de café y chocolate.',
      precio: 5800,
      abv: 9.5,
      ibu: 60,
      formato: '500ml',
      stock: 50,
      imagen: 'images/imperial-stout.jpg',
      ingredientes: ['Agua', 'Malta tostada', 'Lúpulo', 'Levadura', 'Café'],
      temperatura: '12-14°C',
    },
    {
      nombre: 'West Coast IPA',
      tipo: 'IPA',
      descripcion: 'IPA con perfil lupulado, notas cítricas y amargor pronunciado.',
      precio: 4800,
      abv: 6.8,
      ibu: 70,
      formato: '355ml',
      stock: 80,
      imagen: 'images/west-coast-ipa.jpg',
      ingredientes: ['Agua', 'Malta pale', 'Lúpulo Cascade', 'Levadura'],
      temperatura: '6-8°C',
    },
    {
      nombre: 'Amber Ale',
      tipo: 'Ale',
      descripcion: 'Cerveza ámbar con equilibrio entre malta y lúpulo.',
      precio: 4200,
      abv: 5.5,
      ibu: 35,
      formato: '330ml',
      stock: 90,
      imagen: 'images/amber-ale.jpg',
      ingredientes: ['Agua', 'Malta caramelo', 'Lúpulo', 'Levadura'],
      temperatura: '8-10°C',
    },
    {
      nombre: 'Pilsner Bohemia',
      tipo: 'Lager',
      descripcion: 'Lager clásica con carácter herbal del lúpulo Saaz.',
      precio: 3800,
      abv: 5.2,
      ibu: 40,
      formato: '330ml',
      stock: 120,
      imagen: 'images/pilsner-bohemia.jpg',
      ingredientes: ['Agua', 'Malta pilsner', 'Lúpulo Saaz', 'Levadura'],
      temperatura: '4-6°C',
    },
    {
      nombre: 'Double IPA',
      tipo: 'IPA',
      descripcion: 'IPA doble con alto contenido alcohólico y lupulado intenso.',
      precio: 5500,
      abv: 8.2,
      ibu: 85,
      formato: '500ml',
      stock: 60,
      imagen: 'images/double-ipa.jpg',
      ingredientes: ['Agua', 'Malta pale', 'Lúpulo Mosaic', 'Lúpulo Citra', 'Levadura'],
      temperatura: '8-10°C',
    },
    {
      nombre: 'Belgian Wit',
      tipo: 'Ale',
      descripcion: 'Cerveza de trigo belga, suave y especiada.',
      precio: 4500,
      abv: 4.5,
      ibu: 15,
      formato: '330ml',
      stock: 75,
      imagen: 'images/belgian-wit.jpg',
      ingredientes: ['Agua', 'Trigo', 'Malta de cebada', 'Coriandro', 'Cáscara de naranja', 'Levadura'],
      temperatura: '5-7°C',
    },
    {
      nombre: 'Oatmeal Stout',
      tipo: 'Stout',
      descripcion: 'Stout cremosa con avena, notas de chocolate y café.',
      precio: 5200,
      abv: 6.5,
      ibu: 45,
      formato: '500ml',
      stock: 55,
      imagen: 'images/oatmeal-stout.jpg',
      ingredientes: ['Agua', 'Malta tostada', 'Avena', 'Lúpulo', 'Levadura'],
      temperatura: '10-12°C',
    },
    {
      nombre: 'Hazy IPA',
      tipo: 'IPA',
      descripcion: 'IPA turbia con perfil frutal y bajo amargor.',
      precio: 5000,
      abv: 7.0,
      ibu: 50,
      formato: '355ml',
      stock: 70,
      imagen: 'images/hazy-ipa.jpg',
      ingredientes: ['Agua', 'Malta pale', 'Avena', 'Lúpulo Citra', 'Levadura'],
      temperatura: '6-8°C',
    },
    {
      nombre: 'Robust Porter',
      tipo: 'Porter',
      descripcion: 'Porter robusta con sabores tostados y achocolatados.',
      precio: 4700,
      abv: 6.0,
      ibu: 40,
      formato: '330ml',
      stock: 65,
      imagen: 'images/robust-porter.jpg',
      ingredientes: ['Agua', 'Malta chocolate', 'Malta tostada', 'Lúpulo', 'Levadura'],
      temperatura: '10-12°C',
    },
    {
      nombre: 'Smoked Porter',
      tipo: 'Porter',
      descripcion: 'Porter ahumada con notas de madera y café.',
      precio: 5300,
      abv: 6.8,
      ibu: 50,
      formato: '500ml',
      stock: 45,
      imagen: 'images/smoked-porter.jpg',
      ingredientes: ['Agua', 'Malta ahumada', 'Malta tostada', 'Lúpulo', 'Levadura'],
      temperatura: '11-13°C',
    },
    {
      nombre: 'Session IPA',
      tipo: 'IPA',
      descripcion: 'IPA ligera y refrescante con carácter lupulado.',
      precio: 4000,
      abv: 4.2,
      ibu: 45,
      formato: '330ml',
      stock: 100,
      imagen: 'images/session-ipa.jpg',
      ingredientes: ['Agua', 'Malta pale', 'Lúpulo Simcoe', 'Levadura'],
      temperatura: '5-7°C',
    },
  ];

  console.log('🌱 Iniciando seed de productos...');

  for (const productoData of productos) {
    try {
      await productosService.create(productoData);
      console.log(`✅ Producto creado: ${productoData.nombre}`);
    } catch (error) {
      console.error(`❌ Error creando ${productoData.nombre}:`, error.message);
    }
  }

  console.log('✅ Seed completado!');
  await app.close();
}

bootstrap();
