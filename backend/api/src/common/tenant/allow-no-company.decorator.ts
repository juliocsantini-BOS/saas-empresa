import { SetMetadata } from '@nestjs/common';

export const ALLOW_NO_COMPANY_KEY = 'allowNoCompany';

/**
 * Marca endpoints que podem ser acessados sem companyId (ex.: bootstrap/onboard).
 */
export const AllowNoCompany = () => SetMetadata(ALLOW_NO_COMPANY_KEY, true);
