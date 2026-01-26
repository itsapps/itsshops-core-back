import { defineConfig, WorkspaceOptions } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'
// import { documentListWidget } from 'sanity-plugin-dashboard-widget-document-list'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'

import { ItsshopsConfig, SchemaContext } from './types';
// import { setCoreConfig } from './config';
import { mapConfig } from './config/mapper';

import { localizedStructure } from './structure'
import {
  // createFieldTranslator,
  // createStructureTranslator,
  createCoreTranslator,
  getTranslationBundles,
  getStructureOverrideBundles,
  getTranslationPackage,
} from './localization'
import { buildSchemas } from './schemas'
import { CustomToolbar } from './components/CustomToolbar'
import { createI18nHelper, createFormatHelpers } from './utils/localization';

export function createCoreBack(config: ItsshopsConfig) {
  const coreConfig = mapConfig(config);
  
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
  const translationBundles = getTranslationBundles(coreConfig.localization.uiLanguages, coreConfig.localization.overrides.general)
  const structureOverrideBundles = getStructureOverrideBundles(coreConfig.localization.uiLanguages)
  
  const workspace = defineConfig(coreConfig.localization.uiLanguages.map(language => {
    const coreTranslator = createCoreTranslator(coreConfig, language.id)
    const getLocalizedValue = createI18nHelper(language.id, coreConfig.localization.defaultLocale);
    const format = createFormatHelpers(language.id);

    // const fieldTranslator = createFieldTranslator(coreConfig.localization.uiLanguages, language, coreConfig.localization.fieldTranslationOverrides)
    const schemaContext: SchemaContext = { config: coreConfig, t: coreTranslator.t, tStrict: coreTranslator.tStrict, locale: language.id, getLocalizedValue, format };
    const structureContext: SchemaContext = { config: coreConfig, t: coreTranslator.t, tStrict: coreTranslator.tStrict, locale: language.id, getLocalizedValue, format };

    // const structureTranslator = createStructureTranslator(coreConfig.localization.uiLanguages, language, coreConfig.localization.structureTranslationOverrides)
    const structure = localizedStructure(structureContext)

    const schemaTypes = buildSchemas(schemaContext)
    const internalizedArrayPlugin = internationalizedArray({
      languages: coreConfig.localization.uiLanguages,
      fieldTypes: localizedFieldTypes,
      buttonAddAll: false,
      languageDisplay: 'titleOnly',
    })

    const config: WorkspaceOptions = {
      name: language.id,
      basePath: `/${language.id}`,
      title: `${workspaceName} (${language.title})`,
      projectId,
      dataset,
      plugins: [
        internalizedArrayPlugin,
        structureTool({structure}),
        visionTool(),
        media(),
        ...getTranslationPackage(language.id),
      ],
      schema: {
        types: schemaTypes,
        // types: [...customerSchemas],
        // types: [...coreSchemas, ...customerSchemas],
      },
      studio: {
        components: {
          toolMenu: (props) => CustomToolbar({...props}),
        },
      },
      document: {
        comments: {
          enabled: false,
        },
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
