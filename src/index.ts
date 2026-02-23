import {definePlugin} from 'sanity'
import { structureTool } from 'sanity/structure'

import type { CountryOption, ITSLocaleContext, ItsshopsConfig } from './types'

import { defineConfig, WorkspaceOptions } from 'sanity'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { presentationTool } from 'sanity/presentation'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'

import { createi18nFieldTypes } from './config/fieldTypes';
import { createTranslator, createI18nHelpers, createFormatHelpers } from './localization';
import { getTranslationBundles, getStructureOverrideBundles, getTranslationPackage } from './localization/sanityTranslation';
import { createPresentations } from './presentation';

import { mapConfig } from './config/mapper';
import { createStructureTool } from './config/structure';
import { createFeatureRegistry } from './config/features'
import { actionResolver } from './config/actions'
import { templateResolver } from './config/templates'
// import { defaultTheme } from './config/theme'
import { buildSchemas } from './schemas'

import { CustomToolbar } from './components/CustomToolbar'
import { ITSStudioWrapper } from './context/ITSStudioWrapper'


// interface ItsshopsConfig {
//   /* nothing here yet */
// }

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {myPlugin} from 'sanity-plugin-core-back'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [myPlugin()],
 * })
 * ```
 */
// export const itsshops = definePlugin<ItsshopsConfig | void>((config = {}) => {
export const itsshopsPlugin = definePlugin<ITSLocaleContext>((context) => {
  const presentationOptions = createPresentations({ ...context, t: context.structureT })
  // eslint-disable-next-line no-console
  // console.log('hello from sanity-plugin-core-back')
  // return {
  //   name: 'sanity-plugin-core-back',
  // }
  return {
    name: 'sanity-plugin-itsshops-core-back',
    plugins: [
      internationalizedArray({
        languages: context.config.localization.fieldLanguages,
        fieldTypes: context.config.localization.localizedFieldTypes,
        buttonAddAll: false,
        languageDisplay: 'titleOnly',
      }),
      structureTool(createStructureTool({ ...context, t: context.structureT })),
      visionTool(),
      media(),
      presentationTool(presentationOptions),
      ...getTranslationPackage(context.locale),
    ],
    schema: {
      types: buildSchemas({ ...context, t: context.schemaT }),
      templates: (prev) => templateResolver(prev, context),
    },
    studio: {
      components: {
        layout: ITSStudioWrapper(context),
        toolMenu: (props) => CustomToolbar({ ...props }),
      },
    },
    document: {
      comments: { enabled: false },
      actions: (prev, ctx) => actionResolver(prev, ctx, context.featureRegistry),
    },
    i18n: {
      bundles: [
        ...getTranslationBundles(context.config.localization.uiLanguages, context.config.localization.overrides.general),
        ...getStructureOverrideBundles(context.config.localization.uiLanguages)
      ]
    }
  }
})

export function createItsshopsWorkspaces(config: ItsshopsConfig): WorkspaceOptions[] {
  const coreConfig = mapConfig(config)
  const translator = createTranslator({
    isDev: coreConfig.isDev,
    fallbackLng: coreConfig.localization.defaultLocale,
    supportedLngs: coreConfig.localization.uiLocales,
    overrides: coreConfig.localization.overrides

  })
  // const translationBundles = getTranslationBundles(coreConfig.localization.uiLanguages, coreConfig.localization.overrides.general)
  // const structureOverrideBundles = getStructureOverrideBundles(coreConfig.localization.uiLanguages)
  const featureRegistry = createFeatureRegistry(coreConfig)
  const i18nFieldTypes = createi18nFieldTypes(coreConfig.localization.localizedFieldTypes)
  
  // const { projectId, dataset, workspaceName } = config

  return coreConfig.localization.uiLanguages.map(language => {
    const locale = language.id
    const localizer = createI18nHelpers(locale, coreConfig.localization.defaultLocale)
    const format = createFormatHelpers(locale)
    const countryOptions: CountryOption[] = coreConfig.localization.countries.map(country => ({ title: `${country.code} (${localizer.dictValue(country.title)})`, value: country.code }))

    const schemaT = translator('schema', locale)
    const structureT = translator('structure', locale)
    const localeContext: ITSLocaleContext = {
      config: coreConfig,
      featureRegistry,
      locale,
      localizer,
      format,
      countryOptions,
      i18nFieldTypes,
      schemaT,
      structureT
    }
    
    // const schemaContext = {...localeContext, t: schemaT}
    // const structureContext = {...localeContext, t: structureT}
    // const presentationOptions = createPresentations(structureContext)
    
    return {
      name: locale,
      basePath: `/${locale}`,
      projectId: config.projectId,
      dataset: config.dataset,
      title: `${language.locale.split('-')[0].toUpperCase()} - ${config.workspaceName}`,
      icon: coreConfig.workspaceIcon,
      plugins: [itsshopsPlugin(localeContext)], // Pass the context to the plugin
    }
  })
}