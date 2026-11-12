/**
 * Credentials the Studio needs, stored in the dataset document `secrets.itsshops` via
 * `@sanity/studio-secrets` (dotted id → readable by logged-in project members only, not by the
 * internet; included in dataset exports). Entered by an administrator in the toolbar's
 * Integrations dialog, per dataset (development = staging, production = live).
 * Never put these into `SANITY_STUDIO_*` env or `sanity.config.ts` — both are bundled publicly.
 */
export const SECRETS_NAMESPACE = 'itsshops'

export type ITSIntegrationSecrets = {
  /** Must match SERVER_FUNCTIONS_SECRET of the frontend (refunds, customer mails). */
  functionsSecret?: string
  /** Netlify build hook URL of the frontend (Deploy button). */
  netlifyBuildHook?: string
  /** Vinofact API token (only with `shop.vinofact`). */
  vinofactToken?: string
}
