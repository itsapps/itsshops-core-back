import {PackageIcon} from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";
import { createSharedProductFields, createProductVariantGroups } from "./productAndVariantFields";
import { PriceInput } from "../../components/PriceInput";

export const productVariant: ITSSchemaDefinition = {
  name: 'productVariant',
  type: 'document',
  icon: PackageIcon,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate' ],
  allowCreate: false,
  build: (ctx) => {
    const { f } = ctx;
    return {
      groups: createProductVariantGroups(ctx),
      fields: [
        f('title', 'i18nString'),
        f('price', 'number', {
          validation: (Rule) => Rule.positive(),
          group: 'pricing',
          components: {
            input: PriceInput,
          },
        }),
        ...createSharedProductFields(ctx),
        f('active', 'boolean', { initialValue: true, group: 'product', }),
        f('options', 'array', { 
          group: 'product',
          of: [
            {
              type: 'reference',
              to: [{type: 'variantOption'}]
            }
          ],
          readOnly: true
        }),
        f('featured', 'boolean', { initialValue: false, group: 'product', }),
        f('coverImage', 'string', { hidden: true, group: 'media', }),
      ],
      preview: {
        select: {
          title: 'title',
          options0: 'options.0.title',
          options1: 'options.1.title',
          options2: 'options.2.title',
          // image: 'images.0.asset',
        },
        prepare({ title, options0, options1, options2, image }) {
          return {
            title: ctx.localizer.value(title),
            subtitle: [options0, options1, options2].map(o => ctx.localizer.value(o)).filter(Boolean).join(", "),
            media: image,
          }
        },
      }
    }
  }
};