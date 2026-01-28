import { ItsshopsConfig, ITSContext, ITSTranslator, CoreBackConfig, ITSFeatureRegistry } from './types';
export type { 
  CoreDocument,
  CoreObject,
  SanityDefinedAction,
  ITSStructureItem,
} from './types';
export type { Rule } from 'sanity'

import { sanityApiVersion } from './utils/constants'

import { defineConfig, WorkspaceOptions, Template } from 'sanity'
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

import { buildSchemas, createFeatureRegistry } from './schemas'
import { CustomToolbar } from './components/CustomToolbar'
import { actionResolver } from './config/actions'
import { ITSStudioWrapper } from './context/ITSStudioWrapper'

export function createCoreBack(config: ItsshopsConfig) {
  const coreConfig = mapConfig(config);
  const translator = createTranslator(coreConfig)
  const translationBundles = getTranslationBundles(coreConfig.localization.uiLanguages, coreConfig.localization.overrides.general)
  const structureOverrideBundles = getStructureOverrideBundles(coreConfig.localization.uiLanguages)
  const featureRegistry = createFeatureRegistry(coreConfig)
  const enabledDocuments = featureRegistry.getEnabled();
  
  const { projectId, dataset, workspaceName } = config
  
  const localizedFieldTypes = [
    'string',
    'cropImage',
    // 'complexPortableText',
    // {
    //   name: 'cropImage', // This is the base type
    //   type: 'image',
    //   options: { layout: 'grid' },
    //   // of: [
    //   //   { type: 'localeImage' }, 
    //   // ]
    // },
    {
      name: 'complexPortableText', // This is the base type
      type: 'array',
      of: [
        { type: 'block' }, 
      ]
    },
    ...config.i18n?.localizedFieldTypes || []]
  
  
  const workspace = defineConfig(coreConfig.localization.uiLanguages.map(language => {
    const schemaContext = createContext(
      'schema',
      language.id,
      coreConfig,
      featureRegistry,
      translator,
    );
    
    const structureContext = createContext(
      'structure',
      language.id,
      coreConfig,
      featureRegistry,
      translator,
    )

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
        types: buildSchemas(enabledDocuments, schemaContext),
        templates: (prev) => {
          const templates = []
          if (featureRegistry.isEnabled('category')) {
            const category2Child: Template = {
              id: 'subCategory',
              title: 'Sub-category',
              schemaType: 'category',
              parameters: [{name: `parentCategoryId`, title: `Parent Category ID`, type: `string`}],
              value: (parameters: {parentCategoryId: string}) => ({
                parent: {
                  _type: `reference`,
                  _ref: parameters.parentCategoryId
                }
              })
            }
            templates.push(category2Child)
          }
          const allowedDocs = featureRegistry.getEnabled()
            .filter(doc => {
              return !doc.isSingleton && doc.allowCreate !== false;
            })

          const allowedDocIds = allowedDocs.map(doc => doc.name)
          return [
            ...prev.filter((template) => allowedDocIds.includes(template.schemaType)),
            ...templates,
          ]
        },
        // templates: (prev) => {
        //   const singletons = enabledDocs.filter(d => d.isSingleton).map(d => d.name);
        //   return prev.filter(template => !singletons.includes(template.schemaType));
        // }
      },
      studio: {
        components: {
          layout: ITSStudioWrapper(structureContext),
          toolMenu: (props) => CustomToolbar({...props}),
        },
      },
      document: {
        comments: {
          enabled: false,
        },
        actions:  (prev, context) => actionResolver(prev, context, featureRegistry),
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

function createContext(
  ns: string,
  locale: string,
  coreConfig: CoreBackConfig,
  featureRegistry: ITSFeatureRegistry,
  translator: (namespace: string, locale: string) => ITSTranslator,
) { 
  const context: ITSContext = {
    config: coreConfig,
    apiVersion: sanityApiVersion,
    featureRegistry,
    locale,
    helpers: {
      t: translator(ns, locale),
      localizer: createI18nHelpers(locale, coreConfig.localization.defaultLocale),
      // localizer: {
      //   value: createI18nHelper(locale, coreConfig.localization.defaultLocale),
      //   objectValue: createI18nObjectHelper(locale, coreConfig.localization.defaultLocale),
      //   dictValue: createI18nDictHelper(locale, coreConfig.localization.defaultLocale, coreConfig.localization.fieldLocales),
      // },
      format: createFormatHelpers(locale),
    }
  };
  
  return context
}