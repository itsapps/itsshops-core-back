import type { FieldContext } from "../types";
import { PriceInput } from "../components/PriceInput";

export const createSharedProductFields = (ctx: FieldContext) => {
  const { f } = ctx;
  const fields = [
    f('productNumber', 'string'),
    // f('info', 'internationalizedArrayInformation'),
    f('stock', 'number', { initialValue: 0, validation: (Rule) => Rule.positive() }),
    f('stockThreshold', 'number', { validation: (Rule) => Rule.min(0) }),
    // TODO: descirption and stuff f('description', 'localeComplexPortable'),
    {
      name: 'modules',
      title: ctx.t('page.modules.title'),
      type: 'array',
      of: [
        { type: 'multiColumns' },
        { type: 'youtube' },
      ],
    },
    f('images', 'array', { 
      of: [ { type: "localeImage" } ],
      // options: { layout: 'grid' }
    }),
    // f('slideshow', 'internationalizedArrayLocaleImage', {
    //   options: { layout: 'grid' },
    // }),
    f('compareAtPrice', 'number', {
      validation: (Rule) => Rule.positive(),
      // group: 'pricing',
      components: {
        input: PriceInput,
      },
    }),
    f('seo', 'seo'),
    // f('tags', 'array', {
    //   validation: (rule) => rule.unique(),
    //   of: [
    //     {
    //       type: 'reference',
    //       to: [{type: 'tag'}]
    //     }
    //   ],
    // }),
    // f('categories', 'array', {
    //   validation: (rule) => rule.unique(),
    //   of: [
    //     {
    //       type: 'reference',
    //       to: [{type: 'category'}]
    //     }
    //   ],
    //   options: {
    //     disableActions: ['duplicate', 'addBefore', 'addAfter', 'copy'],
    //     sortable: false,
    //   },
    // }),
    // f('manufacturers', 'array', {
    //   validation: (rule) => rule.unique(),
    //   of: [
    //     {
    //       type: 'reference',
    //       to: [{type: 'manufacturer'}]
    //     }
    //   ],
    // }),
  ];

  return fields;
};