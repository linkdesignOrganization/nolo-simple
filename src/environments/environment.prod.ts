export const environment = {
  production: true,
  siteUrl: 'https://nolo.ar',
  // CRM real (mismo CRM que Link Design). El CRM distingue a Nolo por el Origin (nolo.ar): requiere
  // que nolo.ar y www.nolo.ar estén en el setting webLeadDomainMap del CRM (UI /settings) → país AR.
  crmEndpoint: 'https://linkdesign-crm-api.azurewebsites.net/api/v1/leads',
  crmApiKey: '93cb9e26e3576d3a63eac6418469dcb8b06734d40ca620373fd117033c22bcd8'
};
