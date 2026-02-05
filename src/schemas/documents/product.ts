import { PackageIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";
import { createSharedProductFields, createProductGroups } from "./productAndVariantFields";
import { PriceInput } from "../../components/PriceInput";
import { GenerateVariants } from "../../components/GenerateVariants";

export const product: ITSSchemaDefinition = {
  name: 'product',
  type: 'document',
  icon: PackageIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  build: (ctx) => {
    const { f } = ctx;
    return {
      groups: createProductGroups(ctx),
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
        f('price', 'number', {
          validation: (Rule) => Rule.positive().required(),
          group: 'pricing',
          components: {
            input: PriceInput,
          },
        }),
        // f('i18nTitel', 'number', { validation: (Rule) => Rule.required().min(3) }),
        // f('i18nTitel', 'i18nString', { i18n: ['atLeastOne', { min: 3, warning: false }] }),
        // f('i18nTitel', 'i18nString', { i18n: ['requiredDefault', { min: 3, warning: false }] }),
        // f('i18nTitel', 'i18nString', { i18n: ['requiredDefault', { min: 3, warning: true }] }),
        // f('i18nTitel222', 'i18nString', { i18n: 'atLeastOneWarning' }),
        ...createSharedProductFields(ctx),
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
      preview: {
        select: {
          title: 'title',
          image: 'images.0.asset',
          variants: 'variants',
        },
        prepare({ title, image, variants }) {
          const count = (variants && variants.length > 0) ? variants.length : 0
          const variantInfo = count > 0 ? ctx.t.default('product.preview.variants', undefined, { count }) : undefined
          // const subtitle = [variantInfo].filter(Boolean).join(", ")
          return {
            title: ctx.localizer.value(title),
            ...variantInfo && {subtitle: variantInfo},
            media: image || PackageIcon,
          }
        },
      }
    }
  },
};
