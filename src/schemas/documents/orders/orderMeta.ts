import { ITSDocumentDefinition } from "../../../types";
import { buildShared } from './orderAndOrderMetaFields';

import { TrolleyIcon } from '@sanity/icons'
import { isDev } from 'sanity'

export const orderMeta: ITSDocumentDefinition = {
  name: 'orderMeta',
  type: 'document',
  icon: TrolleyIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate' ],
  allowCreate: isDev,
  hideInStructure: true,
  build: (ctx) => {
    // const { f } = ctx;

    // const groups = ['order'].map((name, index) => ({
    //   name, ...index === 0 && { default: true }
    // }));

    // const fieldsMap: Record<string, FieldDefinition[]> = {
    //   order: [
        
    //   ],
    // }

    // const fields = groups.map(({ name }) => ([
    //   ...fieldsMap[name].map(field => ({ ...field, group: name }))
    // ])).flat();

    // const shared = buildShared(ctx);
    // fields.push(...shared.fields);
    // groups.push(...shared.groups);

    // return {
    //   groups,
    //   fields,
    // }
    const shared = buildShared(ctx);
    return {...shared, __experimental_omnisearch_visibility: false, }

    // return {
    //   fields: [
    //     f('title', 'i18nString', { i18n: 'atLeastOne' }),
    //   ],
    //   __experimental_omnisearch_visibility: false,
    // }
  },
  // preview: (ctx: ITSContext) => {
  //   return {
  //     select: {
  //       title: 'title',
  //       subtitle: 'parent.title',
  //       media: 'image',
  //     },
  //     prepare(s: any) {
  //       const { title, subtitle, media } = s
  //       const sub = ctx.getLocalizedValue(subtitle)
  //       return {
  //         title: ctx.getLocalizedValue(title),
  //         subtitle: sub ? `– ${sub}` : ``,
  //         media: media,
  //       }
  //     },
  //   }
  // }
};
