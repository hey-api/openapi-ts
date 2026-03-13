import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';

export function configureApp(app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  return app;
}
