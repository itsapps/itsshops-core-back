import type { FieldContext, ITSContext } from "../../types";

import {PackageIcon} from '@sanity/icons'

import { PriceInput } from "../../components/PriceInput";

export const createSharedProductFields = (ctx: FieldContext) => {
  const { f } = ctx;
  const fields = [
    f('productNumber', 'string', { group: 'product' }),
    f('stock', 'number', { initialValue: 0, validation: (Rule) => Rule.positive(), group: 'stock' }),
    f('stockThreshold', 'number', { validation: (Rule) => Rule.min(0), group: 'stock' }),
    // TODO: descirption and stuff f('description', 'localeComplexPortable'),
    f('description', 'i18nString'),
    // { name: 'modules', type: 'array',
    //   of: [
    //     { type: 'multiColumns' },
    //     { type: 'carousel' },
    //     { type: 'youtube' },
    //   ],
    //   group: 'media',
    // },
    // f('modules', 'array', {
    //   of: [
    //     { type: 'multiColumns' },
    //     { type: 'youtube' },
    //     { type: 'carousel', icon: PackageIcon },
    //   ],
    //   group: 'media',
    // }),
    f('images', 'array', { 
      of: [ { type: "localeTextsImage" } ],
      group: 'media',
      // options: { layout: 'grid' },
      // options: {
      //   layout: 'grid',
      //   modal: {
      //     type: 'popover',
      //     width: 400,
      //   },
      //   views: [
      //     {name: 'list'},
      //     {name: 'grid'},
      //   ],
      // }
    }),

    // f('slideshow', 'internationalizedArrayLocaleImage', {
    //   options: { layout: 'grid' },
    // }),
    f('compareAtPrice', 'number', {
      validation: (Rule) => Rule.positive(),
      group: 'pricing',
      components: {
        input: PriceInput,
      },
    }),
    f('seo', 'seo', { group: 'seo' }),
    // f('tags', 'array', {
    //   validation: (rule) => rule.unique(),
    //   of: [
    //     {
    //       type: 'reference',
    //       to: [{type: 'tag'}]
    //     }
    //   ],
    // }),
    f('categories', 'array', {
      validation: (rule) => rule.unique(),
      of: [
        {
          type: 'reference',
          // title: ctx.t('category.title'),
          to: [{type: 'category'}]
        }
      ],
      group: 'product',
      options: {
        disableActions: ['duplicate', 'addBefore', 'addAfter', 'copy'],
        sortable: false,
      },
    }),
    f('manufacturers', 'array', {
      validation: (rule) => rule.unique(),
      of: [
        {
          type: 'reference',
          to: [{type: 'manufacturer'}]
        }
      ],
    }),
  ];

  return fields;
};

export const createSharedProductGroups = (name: string, ctx: ITSContext) => {
  // const path = `${name}.groups`;
  // return [
  //   { name: 'product', title: ctx.t(`${path}.product`), default: true},
  //   { name: 'description', title: ctx.t(`${path}.description`)},
  //   { name: 'pricing', title: ctx.t(`${path}.pricing`)},
  //   { name: 'media', title: ctx.t(`${path}.media`)},
  //   { name: 'seo', title: ctx.t(`${path}.seo`)},
  // ];
  return [
    { name: 'product', default: true},
    { name: 'stock'},
    { name: 'description'},
    { name: 'pricing'},
    { name: 'media'},
    { name: 'seo'},
  ];
}

export const createProductGroups = (ctx: ITSContext) => {
  return [
    ...createSharedProductGroups('product', ctx),
    { name: 'variants'},
  ];
}
export const createProductVariantGroups = (ctx: ITSContext) => {
  return createSharedProductGroups('productVariant', ctx)
}