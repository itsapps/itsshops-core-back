import { CountryOption, ItsshopsConfig } from './types';

import { defineConfig, WorkspaceOptions } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'
import { presentationTool } from 'sanity/presentation'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'

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
  
  const { projectId, dataset, workspaceName } = config
  
  const workspace = defineConfig(coreConfig.localization.uiLanguages.map(language => {
    const localizer = createI18nHelpers(language.id, coreConfig.localization.defaultLocale)
    const countryOptions: CountryOption[] = coreConfig.localization.countries.map(country => ({ title: `${country.code} (${localizer.dictValue(country.title)})`, value: country.code }))

    const localeContext = {
      config: coreConfig,
      featureRegistry,
      locale: language.id,
      localizer,
      format: createFormatHelpers(language.id),
      countryOptions
    }
    
    const schemaContext = {...localeContext, t: translator('schema', localeContext.locale)}
    const structureContext = {...localeContext, t: translator('structure', localeContext.locale)}

    const config: WorkspaceOptions = {
      name: language.id,
      basePath: `/${language.id}`,
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
        //   resolve: {locations: locations(language.id, structureTanslator('liveEditor')), mainDocuments},
        //   previewUrl: {
        //     initial: `${process.env.SANITY_STUDIO_NETLIFY_FUNCTIONS_ENDPOINT}/${language.id}/preview`,
        //   },
        // }),
        ...getTranslationPackage(language.id),
      ],
      schema: {
        types: buildSchemas(schemaContext),
        templates: (prev) => templateResolver(prev, featureRegistry),
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