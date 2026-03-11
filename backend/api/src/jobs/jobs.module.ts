import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { JobsProcessor } from "./jobs.processor";

function parseRedis(url?: string) {
  const u = new URL(url || "redis://localhost:6379");
  return { host: u.hostname, port: Number(u.port || 6379) };
}

@Module({
  imports: [
    BullModule.forRoot({
      connection: parseRedis(process.env.REDIS_URL),
    }),
    BullModule.registerQueue({ name: "default" }),
  ],
  providers: [JobsProcessor],
})
export class JobsModule {}
