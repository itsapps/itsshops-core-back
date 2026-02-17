import { type FieldContext, type ITSContext, ProductType } from "../../types";
import { VinofactWineSelector } from "../../components/VinofactWineSelector";
import { FieldGroupDefinition } from "sanity";

export const createSharedProductFields = (ctx: FieldContext, type: ProductType) => {
  const { f } = ctx;
  const stockEnabled = ctx.featureRegistry.isFeatureEnabled('shop.stock');
  const vinofactEnabled = ctx.featureRegistry.isFeatureEnabled('shop.vinofact');

  const fields = [
    // vinofact wines only in products and variants
    ...(vinofactEnabled && type !== ProductType.Bundle) ? [
      ctx.f('vinofactWineId', 'string', {
        components: { input: VinofactWineSelector },
        group: 'vinofact'
      })
    ] : [],

    f('sku', 'string', { group: 'product' }),

    ...stockEnabled ? [
      f('stock', 'number', { initialValue: 0, validation: (Rule) => Rule.positive(), group: 'stock' }),
      f('stockThreshold', 'number', { validation: (Rule) => Rule.min(0), group: 'stock' }),  
    ] : [],
    
    f('taxCategory', 'reference', { to: [{ type: 'taxCategory' }], group: 'vat' }),

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
      of: [ { type: "localeImage" } ],
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
    ctx.builders.priceField({
      name: 'compareAtPrice',
      validation: (Rule) => Rule.positive(),
      group: 'pricing',
    }),
    f('weight', 'number', {
      validation: Rule => Rule.positive(),
      group: 'pricing',
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
    ...ctx.featureRegistry.isDocEnabled('category') ? [f('categories', 'array', {
      group: 'product',
      validation: (rule) => rule.unique(),
      of: [
        {
          type: 'reference',
          // title: ctx.t('category.title'),
          to: [{type: 'category'}]
        }
      ],
      options: {
        disableActions: ['duplicate', 'addBefore', 'addAfter', 'copy'],
        sortable: false,
      },
    })] : [],
    ...ctx.featureRegistry.isDocEnabled('manufacturer') ? [f('manufacturers', 'array', {
      group: 'product',
      validation: (rule) => rule.unique(),
      of: [
        {
          type: 'reference',
          to: [{type: 'manufacturer'}]
        }
      ],
    })] : [],
  ];

  return fields;
};

export const createSharedProductGroups = (ctx: ITSContext, type: ProductType): FieldGroupDefinition[] => {
  const stockEnabled = ctx.featureRegistry.isFeatureEnabled('shop.stock');
  const vinofactEnabled = ctx.featureRegistry.isFeatureEnabled('shop.vinofact');
  
  return [
    { name: 'product', default: true},
    { name: 'description'},
    { name: 'pricing'},
    { name: 'media'},
    { name: 'seo'},
    { name: 'vat'},
    ...(type === ProductType.Product ? [{ name: 'variants' }] : []),
    ...vinofactEnabled ? [{ name: 'vinofact' }] : [],
    ...stockEnabled ? [{ name: 'stock'}] : [],
  ];
}
