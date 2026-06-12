export const environment = {
  production: true,
  siteUrl: 'https://sowe.ar',
  // ⚠️ STANDBY: crmEndpoint VACÍO = el form SIMULA el envío (todavía NO manda nada al CRM).
  // Para ACTIVAR el envío real (es el MISMO CRM que Link Design; el CRM distingue a Sowe por el
  // Origin del request — sowe.ar — no por un campo del payload):
  //   1) crmEndpoint: 'https://linkdesign-crm-api.azurewebsites.net/api/v1/leads'
  //   2) avisar al CRM para que agregue sowe.ar y www.sowe.ar al Origin allowlist.
  crmEndpoint: '',
  crmApiKey: '93cb9e26e3576d3a63eac6418469dcb8b06734d40ca620373fd117033c22bcd8'
};
