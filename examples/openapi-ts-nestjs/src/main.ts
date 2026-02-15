import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

export const buildApp = async () => {
  const app = await NestFactory.create(AppModule);
  return app;
};

buildApp().then((app) => {
  app.listen(3000).catch((err) => {
    console.error(err);
    process.exit(1);
  });
});
