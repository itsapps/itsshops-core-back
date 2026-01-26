import { SchemaContext, FieldContext, CoreDocument } from "../../types";
import { createSharedProductFields } from "../productAndVariantFields";
import { PriceInput } from "../../components/PriceInput";

export const productVariant: CoreDocument = {
  name: 'productVariant',
  baseFields: (ctx: FieldContext) => {
    const { f } = ctx;
    return [
      f('title', 'i18nString'),
      f('price', 'number', {
        validation: (Rule) => Rule.positive(),
        // group: 'pricing',
        components: {
          input: PriceInput,
        },
      }),
      ...createSharedProductFields(ctx),
      f('active', 'boolean', { initialValue: true }),
      // f('options', 'array', { 
      //   of: [
      //     {
      //       type: 'reference',
      //       to: [{type: 'variantOption'}]
      //     }
      //   ],
      //   readOnly: true
    
      // }),
      f('featured', 'boolean', { initialValue: false }),
      f('coverImage', 'string', { hidden: true }),
    ]
  },
  preview: (ctx: SchemaContext) => {
    return {
      select: {
        title: 'title',
        options0: 'options.0.title',
        options1: 'options.1.title',
        options2: 'options.2.title',
        image: 'images.0.asset',
      },
      prepare(s: any) {
        const { title, options0, options1, options2, image } = s
        return {
          title: ctx.getLocalizedValue(title),
          subtitle: [options0, options1, options2].map(o => ctx.getLocalizedValue(o)).filter(Boolean).join(", "),
          media: image,
        }
      },
    }
  }
};