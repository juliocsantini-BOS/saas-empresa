import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private health: HealthService) {}

  @Public()
  @Get()
  async get() {
    return this.health.check();
  }
}


