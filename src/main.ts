import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with specific options
  app.enableCors({
    origin: '*',
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Enhanced Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Admin API')
    .setDescription('API documentation - payment')
    .setVersion('1.0')
    // .addTag('appointments', 'Appointments management endpoints')
    // .addTag('users', 'Users management endpoints')
    // .addTag('companies', 'Companies management endpoints')
    .addBearerAuth()
    // .setContact('Admin', 'https://your-website.com', 'contact@your-website.com')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  // Setup Swagger with custom options
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Admin API Documentation',
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
    ],
  });

  // Get port from environment variable or use default
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
