import { PackageIcon } from '@sanity/icons'
import { ITSContext, FieldContext, CoreDocument } from "../../types";
import { createSharedProductFields, createProductGroups } from "./productAndVariantFields";
import { PriceInput } from "../../components/PriceInput";
import { GenerateVariants } from "../../components/GenerateVariants";


export const product: CoreDocument = {
  name: 'product',
  icon: PackageIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate'],
  groups: (ctx: ITSContext) => createProductGroups((ctx)),
  fieldsets: [],
  baseFields: (ctx: FieldContext) => {
    const { f } = ctx;
    return [
      // f('content', 'i18nBlock', {
      //   options: {
      //     // These 'of' types are what go inside each localized block array
      //     of: [
      //       { type: 'complexPortableText' },
      //     ]
      //   }
      // }),
      // f('multiple', 'multiColumns'),
      // f('link', 'internalLink', { group: 'product' }),
      f('title', 'i18nString', { i18n: 'atLeastOne', group: 'product' }),
      f('price', 'number', {
        validation: (Rule) => Rule.positive().required(),
        group: 'pricing',
        components: {
          input: PriceInput,
        },
      }),
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
      // f('i18nTitel', 'number', { validation: (Rule) => Rule.required().min(3) }),
      // f('i18nTitel', 'i18nString', { i18n: ['atLeastOne', { min: 3, warning: false }] }),
      // f('i18nTitel', 'i18nString', { i18n: ['requiredDefault', { min: 3, warning: false }] }),
      // f('i18nTitel', 'i18nString', { i18n: ['requiredDefault', { min: 3, warning: true }] }),
      // f('i18nTitel222', 'i18nString', { i18n: 'atLeastOneWarning' }),
      ...createSharedProductFields(ctx),
      // f('n18nRequiredTitel', 'string', { validation: (Rule) => Rule.required() }),
    ]
  },
  preview: (ctx: ITSContext) => {
    return {
      select: {
        title: 'title',
        image: 'images.0.asset',
        variants: 'variants',
      },
      prepare(s: any) {
        const { title, image, variants } = s
        const count = (variants && variants.length > 0) ? variants.length : 0
        const variantInfo = count > 0 ? ctx.helpers.t.default('product.preview.variants', undefined, { count }) : undefined
        // const subtitle = [variantInfo].filter(Boolean).join(", ")
        return {
          title: ctx.helpers.localizer.value(title),
          ...variantInfo && {subtitle: variantInfo},
          media: image,
        }
      },
    }
  }
};
