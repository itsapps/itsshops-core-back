import {
  ItsshopsConfig,
  ITSLocaleContext,
  ITSContext,
  ITSTranslator,
  CoreBackConfig,
  ITSFeatureRegistry
} from './types';
export type {
  ItsshopsConfig,
  ITSSchemaDefinition,
  ITSStructureItem,
} from './types';
export { PriceInput } from './components/PriceInput';

import { defineConfig, WorkspaceOptions } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'
import { presentationTool } from 'sanity/presentation'
// import { documentListWidget } from 'sanity-plugin-dashboard-widget-document-list'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'

// import { setCoreConfig } from './config';
import { mapConfig } from './config/mapper';
import { localizedStructure } from './structure'
import { localizedDefaultDocumentNode } from './structure/defaultDocumentNode'
import {
  createTranslator,
  getTranslationBundles,
  getStructureOverrideBundles,
  getTranslationPackage,
} from './localization'
import { createI18nHelpers, createFormatHelpers } from './utils/localization';

import { buildSchemas } from './schemas'
import { CustomToolbar } from './components/CustomToolbar'
import { createFeatureRegistry } from './config/features'
import { actionResolver } from './config/actions'
import { templateResolver } from './config/templates'
import { ITSStudioWrapper } from './context/ITSStudioWrapper'

export function createCoreBack(config: ItsshopsConfig) {
  const coreConfig = mapConfig(config);
  const translator = createTranslator(coreConfig)
  const translationBundles = getTranslationBundles(coreConfig.localization.uiLanguages, coreConfig.localization.overrides.general)
  const structureOverrideBundles = getStructureOverrideBundles(coreConfig.localization.uiLanguages)
  const featureRegistry = createFeatureRegistry(coreConfig)
  
  const { projectId, dataset, workspaceName } = config
  
  const localizedFieldTypes = [
    'string',
    'text',
    // 'cropImage',
    // 'localeImage',
    'baseImage',
    'localeTextsImage',
    // 'image',
    // 'array',
    // 'customImage',
    // 'complexPortableText',
    // {
    //   name: 'cropImage', // This is the base type
    //   type: 'image',
    //   options: { layout: 'grid' },
    //   // of: [
    //   //   { type: 'localeImage' }, 
    //   // ]
    // },
    // {
    //   name: 'customImages', // This is the base type
    //   type: 'array',
    //   of: [
    //     { type: 'customImage' }, 
    //   ]
    // },
    // {
    //   name: 'porti', // This is the base type
    //   type: 'array',
    //   of: [
    //     { type: 'complexPortableText' }, 
    //   ]
    // },
    ...config.i18n?.localizedFieldTypes || []]
  
  
  const workspace = defineConfig(coreConfig.localization.uiLanguages.map(language => {
    const localeContext = createBaseContext(language.id, coreConfig, featureRegistry);
    const { schemaContext, structureContext } = createContexts(localeContext, translator);

    const config: WorkspaceOptions = {
      name: language.id,
      basePath: `/${language.id}`,
      title: `${workspaceName} (${language.title})`,
      projectId,
      dataset,
      plugins: [
        internationalizedArray({
          languages: coreConfig.localization.uiLanguages,
          fieldTypes: localizedFieldTypes,
          buttonAddAll: false,
          languageDisplay: 'titleOnly',
        }),
        structureTool({
          structure: localizedStructure(structureContext),
          defaultDocumentNode: localizedDefaultDocumentNode(structureContext),
        }),
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
        types: [
          // {
          //   type: 'document',
          //   name: 'bla',
          //   fields: [
          //     {
          //       name: 'title',
          //       title: 'Title',
          //       type: 'string',
          //     },
          //     {
          //       name: 'title2',
          //       title: 'Title',
          //       type: 'array',
          //       of: [
          //         { type: 'string' },
          //       ]
          //     },
          //   ]
          // },
          ...buildSchemas(schemaContext)
        ],
        // types: buildSchemas(schemaContext),
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
        actions: (prev, context) => actionResolver(prev, context, featureRegistry, coreConfig.apiVersion),
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

function createBaseContext(
  locale: string,
  coreConfig: CoreBackConfig,
  featureRegistry: ITSFeatureRegistry
): ITSLocaleContext {
  return {
    config: coreConfig,
    featureRegistry,
    locale,
    localizer: createI18nHelpers(locale, coreConfig.localization.defaultLocale),
    format: createFormatHelpers(locale),
  }
}

function createContexts(
  ctx: ITSLocaleContext,
  translator: (namespace: string, locale: string) => ITSTranslator,
) {
  const createContext = (namespace: string): ITSContext => ({
    ...ctx,
    t: translator(namespace, ctx.locale),
  })

  return {
    schemaContext: createContext('schema'),
    structureContext: createContext('structure'),
  }
}