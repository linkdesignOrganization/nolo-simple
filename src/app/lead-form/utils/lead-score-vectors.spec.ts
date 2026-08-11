import {
  computeLeadScore,
  LEAD_SCORE_ADS_VALUE,
} from './lead-score';
import { LeadPayload } from '../models/lead-payload.model';
import {
  SCORE_VECTORS,
  buildVectorPayload,
} from './lead-score-vectors.shared';

/**
 * Corre los vectores COMPARTIDOS contra la copia del SITIO de la fórmula.
 * El archivo de vectores existe idéntico en los tres repos (CRM y ambos
 * sitios) — ver su cabecera para la regla de oro.
 *
 * ⚠️ ESTA copia es la fuente de verdad: su score decide el value de conversión
 * que se reporta a Google Ads, de donde vienen los clientes. Si estos tests
 * fallan tras tocar la fórmula, el arreglo NUNCA es «ajustar el sitio para que
 * pase» sin evaluar el impacto en Ads primero.
 */
describe('lead scoring — vectores compartidos entre los 3 repos', () => {
  for (const v of SCORE_VECTORS) {
    it(v.name, () => {
      const r = computeLeadScore(
        buildVectorPayload(v) as unknown as LeadPayload
      );
      expect(r.score).toBe(v.expected.score);
      expect(r.category).toBe(v.expected.category);
    });
  }
});

/**
 * La tabla categoría → USD que se reporta a Google Ads. Es LO INTOCABLE:
 * Smart Bidding optimiza contra estos valores desde jul 2026 (escala ×2,
 * ver docs/bitacora-ads-values-troas.md). Si alguien la cambia sin querer,
 * este test lo hace explícito — cambiarla a propósito exige actualizar
 * también la bitácora y evaluar el impacto en la puja.
 */
describe('LEAD_SCORE_ADS_VALUE — la tabla que ve Google Ads', () => {
  it('mantiene los valores exactos acordados (escala ×2 de jul 2026)', () => {
    expect(LEAD_SCORE_ADS_VALUE).toEqual({
      suspicious: null,
      nurture: 30,
      cold: 36,
      warm: 48,
      hot: 60,
    });
  });

  it('suspicious NO dispara conversión (null, no 0)', () => {
    // 0 registraría una conversión de valor cero — null significa no enviar.
    expect(LEAD_SCORE_ADS_VALUE.suspicious).toBeNull();
  });
});
