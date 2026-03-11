import { SetMetadata } from "@nestjs/common";

export const ALLOW_NO_COMPANY_KEY = "allowNoCompany";
export const AllowNoCompany = () => SetMetadata(ALLOW_NO_COMPANY_KEY, true);
