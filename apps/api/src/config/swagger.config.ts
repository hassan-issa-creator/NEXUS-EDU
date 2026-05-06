import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Million Platform API')
    .setDescription(
      `
## نظام مليون التعليمي - API Documentation

### الوحدات المتاحة:
- **Auth**: تسجيل الدخول والتسجيل
- **Users**: إدارة المستخدمين
- **Million Dialogue**: نظام الامتحانات التفاعلية
- **Health**: فحص صحة السيرفر

### المصادقة:
استخدم JWT Bearer Token في جميع الطلبات المحمية.
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'المصادقة وإدارة الجلسات')
    .addTag('Users', 'إدارة المستخدمين')
    .addTag('Million', 'نظام مليون التفاعلي')
    .addTag('Health', 'فحص صحة السيرفر')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Million Platform API Docs',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
}
