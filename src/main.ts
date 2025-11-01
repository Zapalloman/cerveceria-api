import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - Permitir peticiones desde el frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5500',
    credentials: true,
  });

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma tipos automáticamente
    }),
  );

  // Configuración de Swagger (Documentación API)
  const config = new DocumentBuilder()
    .setTitle('Cervecería Craft & Beer API')
    .setDescription('API REST para e-commerce de cervezas artesanales chilenas')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y registro')
    .addTag('productos', 'Gestión de productos (cervezas)')
    .addTag('carrito', 'Carrito de compras')
    .addTag('pedidos', 'Gestión de pedidos')
    .addTag('usuarios', 'Gestión de usuarios')
    .addTag('valoraciones', 'Valoraciones de productos')
    .addTag('pagos', 'Procesamiento de pagos (simulado)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  🍺 ========================================
     Cervecería Craft & Beer API
  ========================================
  🚀 Servidor: http://localhost:${port}
  📚 Swagger: http://localhost:${port}/api/docs
  🗄️  MongoDB: ${process.env.MONGODB_URI}
  🌍 CORS: ${process.env.CORS_ORIGIN}
  ========================================
  `);
}
bootstrap();
