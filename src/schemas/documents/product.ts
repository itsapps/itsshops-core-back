import { Cube } from 'phosphor-react';
import { ITSSchemaDefinition, ProductType } from "../../types";
import { createSharedProductFields, createSharedProductGroups } from "./productAndVariantFields";
import { PriceInput } from "../../components/PriceInput";
import { GenerateVariants } from "../../components/GenerateVariants";
import { ProductPreview } from '../../components/previews/ProductPreview'

export const product: ITSSchemaDefinition = {
  name: 'product',
  type: 'document',
  icon: Cube,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx;
    return {
      groups: createSharedProductGroups(ctx, ProductType.Product),
      fieldsets: [],
      fields: [
        // ...getInternalLinkFields(ctx, { 
        //   to: ['page', 'post'],
        //   includeTitle: false,
        //   includeDisplayType: false 
        // }).map(field => ({
        //   ...field,
        //   // hidden: ({ parent }: any) => parent?.linkType !== 'internal'
        // })),
        // f('content', 'i18nBlock', {
        //   options: {
        //     // These 'of' types are what go inside each localized block array
        //     of: [
        //       { type: 'complexPortableText' },
        //     ]
        //   }
        // }),
        // f('multiple', 'multiColumns'),
        f('title', 'i18nString', { i18n: 'atLeastOne', group: 'product' }),
        ctx.builders.priceField({
          validation: (Rule) => Rule.required(),
          group: 'pricing',
        }),
        // f('price', 'number', {
        //   validation: (Rule) => Rule.positive().required(),
        //   group: 'pricing',
        //   components: {
        //     input: PriceInput,
        //   },
        // }),
        // f('i18nTitel', 'number', { validation: (Rule) => Rule.required().min(3) }),
        // f('i18nTitel', 'i18nString', { i18n: ['atLeastOne', { min: 3, warning: false }] }),
        // f('i18nTitel', 'i18nString', { i18n: ['requiredDefault', { min: 3, warning: false }] }),
        // f('i18nTitel', 'i18nString', { i18n: ['requiredDefault', { min: 3, warning: true }] }),
        // f('i18nTitel222', 'i18nString', { i18n: 'atLeastOneWarning' }),
        ...createSharedProductFields(ctx, ProductType.Product),

        {
  title: "Example object list",
  type: "array",
  name: "example",
  of: [
    {
      type: "object",
      name: "inline",
      fields: [
        { type: "string", name: "title" },
        { type: "number", name: "amount" }
      ]
    }
  ],
  options: {
    list: [
      { _type: "inline", title: "Big amount", amount: 100 },
      { _type: "inline", title: "Small amount", amount: 1 }
    ]
  }
},
        f('variants', 'array', { 
          of: [
            {
              type: 'reference',
              to: [{type: 'productVariant'}]
            }
          ],
          group: 'variants',
          components: {
            input: GenerateVariants
          },
        }),
        // f('n18nRequiredTitel', 'string', { validation: (Rule) => Rule.required() }),
      ],
      // components: {
      //   preview: ProductPreview
      // },
      // preview: {
      //   select: {
      //     title: 'title.0',
      //     productType: '_type',
      //     price: 'price',
      //     variantCount: 'variants.length',
      //     // Get the URL of the image asset
      //     media: 'images.0.image' 
      //   }
      // },
      preview: {
        select: {
          title: 'title',
          image: 'images.0.image',
          variants: 'variants',
        },
        prepare({ title, image, variants }) {
          const count = (variants && variants.length > 0) ? variants.length : 0
          const variantInfo = count > 0 ? ctx.t.default('product.preview.variants', 'variants', { count }) : undefined
          // const subtitle = [variantInfo].filter(Boolean).join(", ")
          return {
            title: ctx.localizer.value(title),
            ...variantInfo && {subtitle: variantInfo},
            media: ctx.localizer.value<any>(image) || Cube,
          }
        },
      }
    }
  },
};
