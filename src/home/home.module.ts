import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { HomeController } from './home.controller.js';
import { HomeService } from './home.service.js';
import { PrismaModule } from 'src/prisma/prisma.module.js';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [PrismaModule],
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class HomeModule {}
