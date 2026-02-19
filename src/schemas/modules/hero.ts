import { ITSSchemaDefinition } from '../../types';
import { Star } from 'phosphor-react'

export const hero: ITSSchemaDefinition = {
  name: 'hero',
  type: 'object',
  icon: Star,
  build: ({ f, builders, t, localizer }) => {
    // Define the UNIQUE fields for this module
    const contentFields = [
      f('title', 'i18nString', { group: 'content' }),
      f('bgImage', 'localeImage', { group: 'media' }),
      f('actions', 'array', {
        of: [
          {
            type: 'object',
            name: 'action',
            fields: builders.internalLink({ required: true, includeTitle: true, includeDisplayType: true }),
            preview: {
              select: {
                type: 'linkReference._type',
                title: 'linkTitle'
              },
              prepare({ type, title }) {
                return {
                  title: type ? t.default(`${type}.title`) : '',
                  subtitle: localizer.value(title)
                }
              }
            }
          },
        ],
        group: 'content',
      })
      // {
      //   type: 'object',
      //   name: 'links',
      //   fields: builders.internalLink({ name: 'cta', includeDisplayType: true }),
      // },
      // ...builders.internalLink({ name: 'cta', includeDisplayType: true }),
      // f('bla', 'object', {
      //   fields: builders.internalLink({ name: 'bla', includeDisplayType: true }),
      //   group: 'links',
      //   options: { collapsed: true, collapsible: true }
      // }),
      // f('text', 'simplePT'),
      // f('text', 'simplePT', { 
      //   input: builders.portableText({ allowLinks: false }) 
      // }),
    ];

    return {
      groups: [
        { name: 'content', default: true },
        { name: 'media' },
        { name: 'settings' },
      ],
      fields: contentFields,
      preview: {
        select: { title: 'title', actions: 'actions' },
        prepare({ title, actions }) {
          return {
            title: localizer.value(title),
            subtitle: t.default('hero.preview.actions', "Actions", { count: actions?.length || 0 }),
            media: Star,
          };
        }
      }
    }
    // Use the module builder to add the "Settings" (anchor, visibility, etc.)
    // const module = builders.module({
    //   name: 'hero',
    //   fields: contentFields,
    //   allowAnchor: true,
    //   allowTheme: true,
    // })
    // return {
    //   ...module,
    //   groups: [
    //     ...module.groups,
    //     {
    //       name: 'links',
    //     }
    //   ]
    // };
  }
};

export const hero2: ITSSchemaDefinition = {
  name: 'hero',
  type: 'object',
  build: ({ f, builders }) => {
    // Define the UNIQUE fields for this module
    const contentFields = [
      f('title', 'i18nString', { i18n: 'atLeastOne' }),
      f('image', 'image', { options: { hotspot: true } }),
      builders.actionGroup({ name: 'actions', max: 2 }),
      // f('text', 'portableText'),
      // f('text', 'portableText', { 
      //   ...builders.portableText({  }) 
      // }),
      // {
      //   type: 'object',
      //   name: 'links',
      //   fields: builders.internalLink({ name: 'cta', includeDisplayType: true }),
      // },
      // ...builders.internalLink({ name: 'cta', includeDisplayType: true }),
      // f('bla', 'object', {
      //   fields: builders.internalLink({ name: 'bla', includeDisplayType: true }),
      //   group: 'links',
      //   options: { collapsed: true, collapsible: true }
      // }),
      // f('text', 'simplePT'),
      // f('text', 'simplePT', { 
      //   input: builders.portableText({ allowLinks: false }) 
      // }),
    ];

    // Use the module builder to add the "Settings" (anchor, visibility, etc.)
    const module = builders.module({
      name: 'hero',
      fields: contentFields,
      allowAnchor: true,
      allowTheme: true,
    })
    return {
      ...module,
      groups: [
        ...module.groups,
        {
          name: 'links',
        }
      ]
    };
  }
};