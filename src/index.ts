export * from './types'

import { visionTool } from '@sanity/vision'
import { definePlugin } from 'sanity'
import { WorkspaceOptions } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { internationalizedArray } from 'sanity-plugin-internationalized-array'
import { media } from 'sanity-plugin-media'

import pkg from '../package.json'
import { CustomToolbar } from './components/CustomToolbar'
// import { CreateWineProducts } from './components/products/CreateWineProducts'
import { actionResolver } from './config/actions'
import { BOTTLE_VOLUMES_ML } from './config/constants/volumes'
import { createFeatureRegistry } from './config/features'
import { createi18nFieldTypes } from './config/fieldTypes'
import { mapConfig } from './config/mapper'
import { createStructureTool } from './config/structure'
import { templateResolver } from './config/templates'
import { createTools } from './config/tools'
import { ITSStudioWrapper } from './context/ITSStudioWrapper'
import { createFormatHelpers, createI18nHelpers, createTranslator } from './localization'
import {
  getStructureOverrideBundles,
  getTranslationPackage,
} from './localization/sanityTranslation'
import { createPresentations } from './presentation'
// import { defaultTheme } from './config/theme'
import { buildSchemas } from './schemas'
import type { CountryOption, ITSContext, ItsshopsConfig, VolumeOption } from './types'

declare const __BUILD_TIME__: string

export const itsshopsPlugin = definePlugin<ITSContext>((context) => {
  // eslint-disable-next-line no-console
  console.info(`[itsshops-core-back] v${pkg.version} built: ${__BUILD_TIME__}`)
  const presentationOptions = createPresentations({ ...context, t: context.structureT })
  return {
    name: '@itsapps/itsshops-core-back',
    plugins: [
      internationalizedArray({
        languages: context.config.localization.fieldLanguages,
        fieldTypes: context.config.localization.localizedFieldTypes,
        buttonAddAll: false,
        languageDisplay: 'titleOnly',
      }),
      structureTool(createStructureTool(context)),
      visionTool(),
      media(),
      presentationTool(presentationOptions),
      ...getTranslationPackage(context.locale),
    ],
    schema: {
      types: buildSchemas(context),
      templates: (prev) => templateResolver(prev, context),
    },
    tools: createTools(context),
    studio: {
      components: {
        layout: ITSStudioWrapper(context),
        toolMenu: (props) => CustomToolbar({ ...props }),
      },
    },
    document: {
      comments: { enabled: false },
      actions: (prev, ctx) => actionResolver(prev, ctx, context),
    },
    i18n: {
      bundles: [...getStructureOverrideBundles(context.config.localization.uiLanguages)],
    },
    releases: {
      enabled: false,
    },
  }
})

export function createItsshopsWorkspaces(config: ItsshopsConfig): WorkspaceOptions[] {
  const coreConfig = mapConfig(config)
  const translator = createTranslator({
    isDev: coreConfig.isDev,
    fallbackLng: coreConfig.localization.defaultLocale,
    supportedLngs: coreConfig.localization.uiLocales,
    overrides: coreConfig.localization.overrides,
  })

  const featureRegistry = createFeatureRegistry(coreConfig)
  const i18nFieldTypes = createi18nFieldTypes(coreConfig.localization.localizedFieldTypes)

  return coreConfig.localization.uiLanguages.map((language) => {
    const locale = language.id

    const schemaT = translator('schema', locale)
    const structureT = translator('structure', locale)
    const componentT = translator('components', locale)

    const localizer = createI18nHelpers(locale, coreConfig.localization.defaultLocale)
    const format = createFormatHelpers(locale)

    const countryOptions: CountryOption[] = coreConfig.localization.countries.map((country) => ({
      title: `${country.code} (${localizer.dictValue(country.title)})`,
      value: country.code,
    }))
    const volumeOptions: VolumeOption[] = BOTTLE_VOLUMES_ML.map((volume) => {
      const liter = volume / 1000
      const display = format.number(liter, { style: 'unit', unit: 'liter' })
      return {
        title: `${schemaT.strict(`constants.bottleVolume.${volume}`) || liter} (${display})`,
        value: volume,
      }
    })
    const context: ITSContext = {
      config: coreConfig,
      featureRegistry,
      locale,
      localizer,
      format,
      constants: {
        countryOptions,
        volumeOptions,
      },
      i18nFieldTypes,
      t: schemaT,
      schemaT,
      structureT,
      componentT,
    }

    return {
      name: locale,
      basePath: `/${locale}`,
      projectId: config.projectId,
      dataset: config.dataset,
      title: `${language.locale.split('-')[0].toUpperCase()} - ${config.workspaceName}`,
      icon: coreConfig.workspaceIcon,
      plugins: [itsshopsPlugin(context)],
    }
  })
}
