import { defineConfig, WorkspaceOptions } from 'sanity'
import { visionTool } from '@sanity/vision'
import { structureTool } from 'sanity/structure'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'

import { ItsshopsConfig, SchemaContext } from './types';
import { setCoreConfig } from './config';

import { localizedStructure } from './structure'
import {
  // createFieldTranslator,
  // createStructureTranslator,
  createCoreTranslator,
  getTranslationBundles,
  getStructureOverrideBundles,
  getTranslationPackage,
} from './localization'
import buildSchemas from './schemas'
import { CustomToolbar } from './components/CustomToolbar'

export function createCoreBack(config: ItsshopsConfig) {
  const coreConfig = setCoreConfig(config);
  
  const { projectId, dataset, workspaceName } = config
  
  const localizedFieldTypes = ['string', ...config.i18n!.localizedFieldTypes || []]
  const translationBundles = getTranslationBundles(coreConfig.localization.uiLanguages, coreConfig.localization.translationOverrides)
  const structureOverrideBundles = getStructureOverrideBundles(coreConfig.localization.uiLanguages)
  
  return defineConfig(coreConfig.localization.uiLanguages.map(language => {
    const coreTranslator = createCoreTranslator(coreConfig, language.id)

    // const fieldTranslator = createFieldTranslator(coreConfig.localization.uiLanguages, language, coreConfig.localization.fieldTranslationOverrides)
    const schemaContext: SchemaContext = { config: coreConfig, t: coreTranslator.t, tStrict: coreTranslator.tStrict };

    // const structureTranslator = createStructureTranslator(coreConfig.localization.uiLanguages, language, coreConfig.localization.structureTranslationOverrides)
    const structure = localizedStructure("bla", coreConfig.features)

    const config: WorkspaceOptions = {
      name: language.id,
      basePath: `/${language.id}`,
      title: `${workspaceName} (${language.title})`,
      projectId,
      dataset,
      schema: {
        types: buildSchemas(schemaContext),
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
      },
      plugins: [
        internationalizedArray({
          languages: coreConfig.localization.uiLanguages,
          fieldTypes: localizedFieldTypes,
          buttonAddAll: false,
          languageDisplay: 'titleOnly',
        }),
        structureTool({structure}),
        visionTool(),
        ...getTranslationPackage(language.id),
      ],
      i18n: {
        bundles: [...translationBundles, ...structureOverrideBundles]
      },
    }
    return config
  }))
}
