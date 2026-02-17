import { CountryOption, ITSLocaleContext, ItsshopsConfig } from './types';

import { defineConfig, WorkspaceOptions } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'
// import { presentationTool } from 'sanity/presentation'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'

import { createi18nFieldTypes } from './config/fieldTypes';
import { createTranslator, createI18nHelpers, createFormatHelpers } from './localization';
import { getTranslationBundles, getStructureOverrideBundles, getTranslationPackage } from './localization/sanityTranslation';


import { mapConfig } from './config/mapper';
import { createStructureTool } from './config/structure';
import { createFeatureRegistry } from './config/features'
import { actionResolver } from './config/actions'
import { templateResolver } from './config/templates'
// import { defaultTheme } from './config/theme'
import { buildSchemas } from './schemas'

import { CustomToolbar } from './components/CustomToolbar'
import { ITSStudioWrapper } from './context/ITSStudioWrapper'

export function createCoreBack(config: ItsshopsConfig) {
  const coreConfig = mapConfig(config);
  const translator = createTranslator({
    isDev: coreConfig.isDev,
    fallbackLng: coreConfig.localization.defaultLocale,
    supportedLngs: coreConfig.localization.uiLocales,
    overrides: coreConfig.localization.overrides

  })
  const translationBundles = getTranslationBundles(coreConfig.localization.uiLanguages, coreConfig.localization.overrides.general)
  const structureOverrideBundles = getStructureOverrideBundles(coreConfig.localization.uiLanguages)
  const featureRegistry = createFeatureRegistry(coreConfig)
  const i18nFieldTypes = createi18nFieldTypes(coreConfig.localization.localizedFieldTypes)
  
  const { projectId, dataset, workspaceName } = config
  
  const workspace = defineConfig(coreConfig.localization.uiLanguages.map(language => {
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
    
    const schemaContext = {...localeContext, t: schemaT}
    const structureContext = {...localeContext, t: structureT}

    const config: WorkspaceOptions = {
      name: locale,
      basePath: `/${locale}`,
      title: `${language.locale.split('-')[0].toUpperCase()} - ${workspaceName}`,
      // title: `${workspaceName} (${language.title})`,
      icon: coreConfig.workspaceIcon,
      // theme: defaultTheme,
      projectId,
      dataset,
      plugins: [
        internationalizedArray({
          languages: coreConfig.localization.uiLanguages,
          fieldTypes: coreConfig.localization.localizedFieldTypes,
          buttonAddAll: false,
          languageDisplay: 'titleOnly',
        }),
        structureTool(createStructureTool(structureContext)),
        visionTool(),
        media(),
        // presentationTool({
        //   resolve: {locations: locations(locale, structureTanslator('liveEditor')), mainDocuments},
        //   previewUrl: {
        //     initial: `${process.env.SANITY_STUDIO_NETLIFY_FUNCTIONS_ENDPOINT}/${locale}/preview`,
        //   },
        // }),
        ...getTranslationPackage(locale),
      ],
      schema: {
        types: buildSchemas(schemaContext),
        templates: (prev) => templateResolver(prev, localeContext),
      },
      studio: {
        components: {
          layout: ITSStudioWrapper(localeContext),
          toolMenu: (props) => CustomToolbar({...props}),
        },
      },
      document: {
        comments: {
          enabled: false,
        },
        actions: (prev, context) => actionResolver(prev, context, featureRegistry),
        unstable_fieldActions: () => [],
      },
      i18n: {
        bundles: [...translationBundles, ...structureOverrideBundles]
      },
    }
    return config
  }))

  return workspace
}