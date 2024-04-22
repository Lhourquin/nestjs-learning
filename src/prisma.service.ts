import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    console.log('onModuleInit, Connection à la base de données.');
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    console.log('onModuleDestroy, Déconnection de la base de données.');
    await this.$disconnect();
  }
}
