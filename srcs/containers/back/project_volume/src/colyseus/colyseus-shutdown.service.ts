import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { colyseusServer } from './server';

@Injectable()
export class ColyseusShutdownService implements OnModuleDestroy {
  async onModuleDestroy() {
    await colyseusServer.gracefullyShutdown(false);
  }
}
