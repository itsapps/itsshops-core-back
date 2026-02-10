import { SlidersHorizontal } from 'phosphor-react';
import { ITSSchemaDefinition, ProductType } from "../../types";
import { createSharedProductFields, createSharedProductGroups } from "./productAndVariantFields";
import { PriceInput } from "../../components/PriceInput";

export const productVariant: ITSSchemaDefinition = {
  name: 'productVariant',
  type: 'document',
  icon: SlidersHorizontal,
  feature: 'shop',
  disallowedActions: ['delete', 'duplicate' ],
  allowCreate: false,
  hideInStructure: true,
  build: (ctx) => {
    const { f } = ctx;
    return {
      groups: createSharedProductGroups(ctx, ProductType.Variant),
      fields: [
        f('title', 'i18nString', { group: 'product' }),
        f('price', 'number', {
          validation: (Rule) => Rule.positive(),
          group: 'pricing',
          components: {
            input: PriceInput,
          },
        }),
        ...createSharedProductFields(ctx, ProductType.Variant),
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
          image: 'images.0.image',
        },
        prepare({ title, options0, options1, options2, image }) {
          return {
            title: ctx.localizer.value(title),
            subtitle: [options0, options1, options2].map(o => ctx.localizer.value(o)).filter(Boolean).join(", "),
            media: ctx.localizer.value<any>(image) || SlidersHorizontal,
          }
        },
      }
    }
  }
};