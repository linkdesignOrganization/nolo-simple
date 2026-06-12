// Reemplazado en el build de producción por environment.prod.ts (ver angular.json → fileReplacements).
export const environment = {
  production: false,
  siteUrl: 'http://localhost:4200',
  // En dev se deja VACÍO para que LeadFormService SIMULE el envío (sin mandar leads reales al CRM).
  crmEndpoint: '',
  crmApiKey: ''
};
