import { Module } from '@nestjs/common';
import { ColyseusShutdownService } from './colyseus-shutdown.service';

@Module({
  providers: [ColyseusShutdownService],
})
export class ColyseusModule {}
