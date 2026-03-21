import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Role,
} from "@prisma/client";
import { randomUUID } from "crypto";
import { RequestContext } from "../common/request-context/request-context";
import { PrismaService } from "../prisma/prisma.service";

type Actor = {
  id?: string | null;
  role?: Role | null;
  companyId?: string | null;
};

type CrmIntegrationProviderValue =
  | "GOOGLE"
  | "GMAIL"
  | "MICROSOFT"
  | "YAHOO"
  | "WHATSAPP"
  | "FACEBOOK"
  | "INSTAGRAM"
  | "OTHER";

type CrmIntegrationCategoryValue = "EMAIL" | "MESSAGING" | "SOCIAL";
type CrmIntegrationConnectionModeValue = "OAUTH" | "API_KEY" | "MANUAL" | "WEBHOOK" | "IMAP_SMTP";
type CrmIntegrationStatusValue =
  | "DISCONNECTED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR"
  | "EXPIRED"
  | "REQUIRES_REAUTH";
type CrmOmnichannelDirectionValue = "INBOUND" | "OUTBOUND" | "SYSTEM";
type CrmOmnichannelMessageStatusValue = "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "RECEIVED";

type ProviderPreset = {
  provider: CrmIntegrationProviderValue;
  label: string;
  category: CrmIntegrationCategoryValue;
  connectionMode: CrmIntegrationConnectionModeValue;
  channelType: string;
  scopes: string[];
  authBaseUrl?: string;
  defaultIdentifierPlaceholder: string;
  webhookSupported?: boolean;
};

const PROVIDER_PRESETS: Record<CrmIntegrationProviderValue, ProviderPreset> = {
  GOOGLE: {
    provider: "GOOGLE",
    label: "Google Workspace",
    category: "EMAIL",
    connectionMode: "OAUTH",
    channelType: "EMAIL",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
    authBaseUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    defaultIdentifierPlaceholder: "workspace@empresa.com",
  },
  GMAIL: {
    provider: "GMAIL",
    label: "Gmail",
    category: "EMAIL",
    connectionMode: "OAUTH",
    channelType: "EMAIL",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
    ],
    authBaseUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    defaultIdentifierPlaceholder: "vendas@gmail.com",
  },
  MICROSOFT: {
    provider: "MICROSOFT",
    label: "Microsoft 365",
    category: "EMAIL",
    connectionMode: "OAUTH",
    channelType: "EMAIL",
    scopes: ["openid", "email", "profile", "offline_access", "Mail.Read", "Mail.Send"],
    authBaseUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    defaultIdentifierPlaceholder: "seller@empresa.com",
  },
  YAHOO: {
    provider: "YAHOO",
    label: "Yahoo Mail",
    category: "EMAIL",
    connectionMode: "OAUTH",
    channelType: "EMAIL",
    scopes: ["openid", "openid2", "mail-r", "mail-w"],
    authBaseUrl: "https://api.login.yahoo.com/oauth2/request_auth",
    defaultIdentifierPlaceholder: "seller@yahoo.com",
  },
  WHATSAPP: {
    provider: "WHATSAPP",
    label: "WhatsApp Business",
    category: "MESSAGING",
    connectionMode: "WEBHOOK",
    channelType: "WHATSAPP",
    scopes: ["whatsapp_business_management", "whatsapp_business_messaging"],
    authBaseUrl: "https://www.facebook.com/dialog/oauth",
    defaultIdentifierPlaceholder: "+55 11 99999-9999",
    webhookSupported: true,
  },
  FACEBOOK: {
    provider: "FACEBOOK",
    label: "Facebook Messenger",
    category: "SOCIAL",
    connectionMode: "WEBHOOK",
    channelType: "FACEBOOK_MESSENGER",
    scopes: ["pages_show_list", "pages_messaging", "business_management"],
    authBaseUrl: "https://www.facebook.com/dialog/oauth",
    defaultIdentifierPlaceholder: "facebook.com/sua-pagina",
    webhookSupported: true,
  },
  INSTAGRAM: {
    provider: "INSTAGRAM",
    label: "Instagram Direct",
    category: "SOCIAL",
    connectionMode: "WEBHOOK",
    channelType: "INSTAGRAM_DM",
    scopes: ["instagram_basic", "instagram_manage_messages", "pages_show_list"],
    authBaseUrl: "https://www.facebook.com/dialog/oauth",
    defaultIdentifierPlaceholder: "@suaempresa",
    webhookSupported: true,
  },
  OTHER: {
    provider: "OTHER",
    label: "Outro provider",
    category: "SOCIAL",
    connectionMode: "MANUAL",
    channelType: "CUSTOM",
    scopes: [],
    defaultIdentifierPlaceholder: "Identificador do canal",
  },
};

@Injectable()
export class CrmIntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureCompanyId(actor: Actor) {
    const companyId = String(actor.companyId ?? "").trim();
    if (!companyId) {
      throw new ForbiddenException("Company obrigatória.");
    }
    return companyId;
  }

  private trim(value: unknown) {
    const normalized = String(value ?? "").trim();
    return normalized || null;
  }

  private normalizeDate(value: unknown) {
    const raw = this.trim(value);
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException("Data inválida.");
    }
    return parsed;
  }

  private getPreset(rawProvider: unknown) {
    const provider = String(rawProvider ?? "").trim().toUpperCase() as CrmIntegrationProviderValue;
    const preset = PROVIDER_PRESETS[provider];
    if (!preset) {
      throw new BadRequestException("Provider de integração inválido.");
    }
    return preset;
  }

  private getBaseAppUrl() {
    return (
      this.trim(process.env.APP_URL) ||
      this.trim(process.env.FRONTEND_URL) ||
      "http://localhost:3001"
    );
  }

  private getApiBaseUrl() {
    return this.trim(process.env.API_URL) || "http://localhost:3000";
  }

  private getOauthClientId(provider: CrmIntegrationProviderValue) {
    switch (provider) {
      case "GOOGLE":
      case "GMAIL":
        return this.trim(process.env.GOOGLE_CLIENT_ID);
      case "MICROSOFT":
        return this.trim(process.env.MICROSOFT_CLIENT_ID);
      case "YAHOO":
        return this.trim(process.env.YAHOO_CLIENT_ID);
      case "WHATSAPP":
      case "FACEBOOK":
      case "INSTAGRAM":
        return this.trim(process.env.META_APP_ID);
      default:
        return null;
    }
  }

  private buildConnectUrl(
    preset: ProviderPreset,
    integrationId: string,
    stateToken: string,
    scopes: string[],
  ) {
    if (!preset.authBaseUrl) {
      return null;
    }

    const clientId = this.getOauthClientId(preset.provider);
    const callbackUrl = `${this.getApiBaseUrl()}/v1/crm/integrations/callback/${preset.provider.toLowerCase()}`;

    if (!clientId) {
      return null;
    }

    const params = new URLSearchParams();
    params.set("client_id", clientId);
    params.set("redirect_uri", callbackUrl);
    params.set("response_type", "code");
    params.set("state", stateToken);

    if (preset.provider === "GOOGLE" || preset.provider === "GMAIL") {
      params.set("access_type", "offline");
      params.set("prompt", "consent");
      params.set("scope", scopes.join(" "));
    } else if (preset.provider === "MICROSOFT") {
      params.set("scope", scopes.join(" "));
    } else if (
      preset.provider === "YAHOO" ||
      preset.provider === "WHATSAPP" ||
      preset.provider === "FACEBOOK" ||
      preset.provider === "INSTAGRAM"
    ) {
      params.set("scope", scopes.join(" "));
    }

    params.set("login_hint", integrationId);

    return `${preset.authBaseUrl}?${params.toString()}`;
  }

  async list(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmChannelIntegration.findMany({
      where: { companyId },
      orderBy: [{ updatedAt: "desc" }],
    });
  }

  async createManual(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const preset = this.getPreset(body?.provider);
    const label = this.trim(body?.label) || preset.label;
    const channelIdentifier =
      this.trim(body?.channelIdentifier) ||
      this.trim(body?.emailAddress) ||
      this.trim(body?.phoneNumber) ||
      this.trim(body?.pageName);

    return (this.prisma as any).crmChannelIntegration.create({
      data: {
        companyId,
        userId: this.trim(body?.userId) || this.trim(actor.id),
        provider: preset.provider,
        category: preset.category,
        connectionMode:
          (this.trim(body?.connectionMode)?.toUpperCase() as CrmIntegrationConnectionModeValue) ||
          preset.connectionMode,
        status:
          (this.trim(body?.status)?.toUpperCase() as CrmIntegrationStatusValue) ||
          "PENDING",
        label,
        channelIdentifier,
        externalAccountId: this.trim(body?.externalAccountId),
        externalPageId: this.trim(body?.externalPageId),
        externalBusinessId: this.trim(body?.externalBusinessId),
        scopes:
          Array.isArray(body?.scopes) && body.scopes.length > 0
            ? body.scopes.map((item: unknown) => String(item))
            : preset.scopes,
        authUrl: this.trim(body?.authUrl),
        callbackUrl:
          this.trim(body?.callbackUrl) ||
          `${this.getApiBaseUrl()}/v1/crm/integrations/callback/${preset.provider.toLowerCase()}`,
        webhookUrl: preset.webhookSupported
          ? `${this.getApiBaseUrl()}/v1/crm/integrations/webhooks/meta`
          : this.trim(body?.webhookUrl),
        webhookVerifyToken:
          this.trim(body?.webhookVerifyToken) ||
          this.trim(process.env.META_WEBHOOK_VERIFY_TOKEN),
        webhookSecret: this.trim(body?.webhookSecret) || this.trim(process.env.META_APP_SECRET),
        configJson: body?.configJson ?? null,
      },
    });
  }

  async createConnectUrl(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const preset = this.getPreset(body?.provider);
    const label = this.trim(body?.label) || preset.label;
    const scopes =
      Array.isArray(body?.scopes) && body.scopes.length > 0
        ? body.scopes.map((item: unknown) => String(item))
        : preset.scopes;

    const stateToken = randomUUID();
    const integration = await (this.prisma as any).crmChannelIntegration.create({
      data: {
        companyId,
        userId: this.trim(actor.id),
        provider: preset.provider,
        category: preset.category,
        connectionMode: preset.connectionMode,
        status: "PENDING",
        label,
        channelIdentifier: this.trim(body?.channelIdentifier),
        scopes,
        callbackUrl: `${this.getApiBaseUrl()}/v1/crm/integrations/callback/${preset.provider.toLowerCase()}`,
        webhookUrl: preset.webhookSupported
          ? `${this.getApiBaseUrl()}/v1/crm/integrations/webhooks/meta`
          : null,
        webhookVerifyToken: preset.webhookSupported
          ? this.trim(process.env.META_WEBHOOK_VERIFY_TOKEN)
          : null,
        configJson: {
          stateToken,
          appUrl: this.getBaseAppUrl(),
          providerLabel: preset.label,
          defaultIdentifierPlaceholder: preset.defaultIdentifierPlaceholder,
        },
      },
    });

    const authUrl = this.buildConnectUrl(preset, integration.id, stateToken, scopes);
    const updated = await (this.prisma as any).crmChannelIntegration.update({
      where: { id: integration.id },
      data: {
        authUrl,
      },
    });

    return {
      integration: updated,
      connectUrl: authUrl,
      callbackUrl: updated.callbackUrl,
      webhookUrl: updated.webhookUrl,
      provider: preset.provider,
      providerLabel: preset.label,
      status: authUrl ? "READY" : "MISSING_CREDENTIALS",
      requiredEnv: this.getRequiredEnv(preset.provider),
    };
  }

  async sync(actor: Actor, integrationId: string) {
    const companyId = this.ensureCompanyId(actor);
    const integration = await (this.prisma as any).crmChannelIntegration.findFirst({
      where: { id: integrationId, companyId },
    });

    if (!integration) {
      throw new NotFoundException("Integração não encontrada.");
    }

    return (this.prisma as any).crmChannelIntegration.update({
      where: { id: integration.id },
      data: {
        status:
          integration.status === "CONNECTED"
            ? "CONNECTED"
            : "PENDING",
        lastSyncAt: new Date(),
        errorMessage: null,
      },
    });
  }

  async listMessages(actor: Actor) {
    const companyId = this.ensureCompanyId(actor);
    return (this.prisma as any).crmOmnichannelMessage.findMany({
      where: { companyId },
      include: {
        integration: true,
        lead: { select: { id: true, name: true, status: true } },
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      take: 100,
    });
  }

  async createMessage(actor: Actor, body: any) {
    const companyId = this.ensureCompanyId(actor);
    const channelType = this.trim(body?.channelType) || "WHATSAPP";
    const content = this.trim(body?.body);

    if (!content) {
      throw new BadRequestException("body é obrigatório.");
    }

    return (this.prisma as any).crmOmnichannelMessage.create({
      data: {
        companyId,
        integrationId: this.trim(body?.integrationId),
        leadId: this.trim(body?.leadId),
        accountId: this.trim(body?.accountId),
        contactId: this.trim(body?.contactId),
        direction:
          (this.trim(body?.direction)?.toUpperCase() as CrmOmnichannelDirectionValue) ||
          "OUTBOUND",
        channelType,
        status:
          (this.trim(body?.status)?.toUpperCase() as CrmOmnichannelMessageStatusValue) ||
          "SENT",
        providerMessageId: this.trim(body?.providerMessageId),
        threadId: this.trim(body?.threadId),
        senderName: this.trim(body?.senderName),
        senderHandle: this.trim(body?.senderHandle),
        recipientHandle: this.trim(body?.recipientHandle),
        body: content,
        attachmentsJson: body?.attachmentsJson ?? null,
        sentAt: this.normalizeDate(body?.sentAt) || new Date(),
        receivedAt: this.normalizeDate(body?.receivedAt),
        readAt: this.normalizeDate(body?.readAt),
        failedAt: this.normalizeDate(body?.failedAt),
        metadataJson: body?.metadataJson ?? null,
      },
    });
  }

  async handleCallback(providerParam: string, query: Record<string, unknown>) {
    const provider = providerParam.trim().toUpperCase() as CrmIntegrationProviderValue;
    const preset = PROVIDER_PRESETS[provider];
    if (!preset) {
      throw new NotFoundException("Provider não suportado.");
    }

    const stateToken = this.trim(query?.state);
    if (!stateToken) {
      throw new BadRequestException("state é obrigatório.");
    }

    const integration = await (this.prisma as any).crmChannelIntegration.findFirst({
      where: {
        provider,
        configJson: {
          path: ["stateToken"],
          equals: stateToken,
        },
      },
    });

    if (!integration) {
      throw new NotFoundException("Integração não encontrada para o callback.");
    }

    const current = (RequestContext as any).get?.() ?? {};
    (RequestContext as any).set?.({
      ...current,
      companyId: integration.companyId,
      isSystem: true,
      systemSource: "crm-integrations-callback",
    });

    const code = this.trim(query?.code);
    const error = this.trim(query?.error);
    const errorDescription = this.trim(query?.error_description);

    const updated = await (this.prisma as any).crmChannelIntegration.update({
      where: { id: integration.id },
      data: {
        status: error ? "ERROR" : "CONNECTED",
        errorMessage: error ? [error, errorDescription].filter(Boolean).join(": ") : null,
        lastSyncAt: error ? integration.lastSyncAt : new Date(),
        configJson: {
          ...(integration.configJson ?? {}),
          authorizationCode: code,
          callbackQuery: query,
          connectedAt: error ? null : new Date().toISOString(),
        },
      },
    });

    return {
      ok: !error,
      provider,
      integrationId: updated.id,
      status: updated.status,
      appRedirectUrl: `${this.getBaseAppUrl()}/dashboard/crm?integration=${updated.id}`,
      message: error
        ? "A conexão retornou erro no provider."
        : "Conexão recebida. Próximo passo: trocar o authorization code por tokens do provider.",
    };
  }

  async verifyMetaWebhook(query: Record<string, unknown>) {
    const mode = this.trim(query["hub.mode"]);
    const token = this.trim(query["hub.verify_token"]);
    const challenge = this.trim(query["hub.challenge"]);
    const expected = this.trim(process.env.META_WEBHOOK_VERIFY_TOKEN);

    if (mode !== "subscribe" || !challenge || !expected || token !== expected) {
      throw new ForbiddenException("Webhook Meta não verificado.");
    }

    return challenge;
  }

  async receiveMetaWebhook(body: any) {
    const entries = Array.isArray(body?.entry) ? body.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      const messaging = Array.isArray(entry?.messaging) ? entry.messaging : [];

      for (const change of changes) {
        await this.storeMetaPayload(change?.value ?? change, entry);
      }

      for (const event of messaging) {
        await this.storeMetaPayload(event, entry);
      }
    }

    return { received: true, entries: entries.length };
  }

  private async storeMetaPayload(payload: any, entry: any) {
    const businessId =
      this.trim(payload?.metadata?.phone_number_id) ||
      this.trim(payload?.recipient?.id) ||
      this.trim(entry?.id);

    if (!businessId) {
      return;
    }

    const integration = await (this.prisma as any).crmChannelIntegration.findFirst({
      where: {
        OR: [
          { externalBusinessId: businessId },
          { externalPageId: businessId },
          { channelIdentifier: businessId },
        ],
      },
      orderBy: [{ updatedAt: "desc" }],
    });

    if (!integration) {
      return;
    }

    const current = (RequestContext as any).get?.() ?? {};
    (RequestContext as any).set?.({
      ...current,
      companyId: integration.companyId,
      isSystem: true,
      systemSource: "crm-integrations-webhook",
    });

    const messageBody =
      this.trim(payload?.text?.body) ||
      this.trim(payload?.message?.text) ||
      this.trim(payload?.message?.mid) ||
      "Evento recebido do provider";

    await (this.prisma as any).crmChannelIntegration.update({
      where: { id: integration.id },
      data: {
        status: "CONNECTED",
        lastInboundAt: new Date(),
      },
    });

    await (this.prisma as any).crmOmnichannelMessage.create({
      data: {
        companyId: integration.companyId,
        integrationId: integration.id,
        direction: "INBOUND",
        channelType: String(integration.provider),
        status: "RECEIVED",
        providerMessageId:
          this.trim(payload?.messages?.[0]?.id) ||
          this.trim(payload?.message?.mid) ||
          this.trim(payload?.mid),
        threadId: this.trim(payload?.conversation?.id),
        senderName: this.trim(payload?.contacts?.[0]?.profile?.name) || this.trim(payload?.sender?.name),
        senderHandle:
          this.trim(payload?.contacts?.[0]?.wa_id) ||
          this.trim(payload?.sender?.id) ||
          this.trim(payload?.from?.id),
        recipientHandle:
          this.trim(payload?.metadata?.display_phone_number) ||
          this.trim(payload?.recipient?.id),
        body: messageBody,
        receivedAt: new Date(),
        metadataJson: payload,
      },
    });
  }

  getProviderCatalog() {
    return Object.values(PROVIDER_PRESETS).map((preset) => ({
      provider: preset.provider,
      label: preset.label,
      category: preset.category,
      connectionMode: preset.connectionMode,
      channelType: preset.channelType,
      scopes: preset.scopes,
      defaultIdentifierPlaceholder: preset.defaultIdentifierPlaceholder,
      webhookSupported: !!preset.webhookSupported,
      requiredEnv: this.getRequiredEnv(preset.provider),
    }));
  }

  private getRequiredEnv(provider: CrmIntegrationProviderValue) {
    switch (provider) {
      case "GOOGLE":
      case "GMAIL":
        return ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "API_URL"];
      case "MICROSOFT":
        return ["MICROSOFT_CLIENT_ID", "MICROSOFT_CLIENT_SECRET", "API_URL"];
      case "YAHOO":
        return ["YAHOO_CLIENT_ID", "YAHOO_CLIENT_SECRET", "API_URL"];
      case "WHATSAPP":
      case "FACEBOOK":
      case "INSTAGRAM":
        return ["META_APP_ID", "META_APP_SECRET", "META_WEBHOOK_VERIFY_TOKEN", "API_URL"];
      default:
        return ["API_URL"];
    }
  }
}
