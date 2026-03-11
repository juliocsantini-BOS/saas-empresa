import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { BootstrapGuard } from "./bootstrap.guard";
import { Public } from "../common/decorators/public.decorator";
import { RequestContext } from "../common/request-context/request-context";

/**
 * ENTERPRISE (Opção A):
 * - Registrado no AuthModule apenas quando NODE_ENV !== "production"
 * - Em produção, a rota /v1/auth/admin-master NÃO EXISTE
 * - Aqui é @Public() para NÃO exigir JWT
 * - Proteção real é BootstrapGuard (flag + token + "já existe ADMIN_MASTER")
 */
@Controller("v1/auth")
export class BootstrapController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @UseGuards(BootstrapGuard)
  @Post("admin-master")
  async adminMaster(@Body() body: any) {
    // marca este request como system para bypass do TENANT_GUARD
    const current: any = (RequestContext as any).get?.() ?? {};
    (RequestContext as any).set?.({ ...current, isSystem: true });

    return this.auth.registerAdminMaster(body ?? {});
  }
}