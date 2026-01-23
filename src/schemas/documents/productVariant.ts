import { SchemaContext, LocalSchemaContext } from "../../types";
import { createFieldFactory, shapeSchema } from "../../utils";
import { createSharedProductFields } from "../productAndVariantFields";
import { PriceInput } from "../../components/PriceInput";

export const createProductVariantSchema = (ctx: SchemaContext) => {
  const docName = 'productVariant';
  const { t } = ctx;
  const f = createFieldFactory(docName, ctx);
  const localCtx: LocalSchemaContext = { ...ctx, f };
  
  const baseFields = [
    f('title', 'i18nString'),
    f('price', 'number', {
      validation: (Rule) => Rule.positive(),
      // group: 'pricing',
      components: {
        input: PriceInput,
      },
    }),
    ...createSharedProductFields(localCtx),
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
  ];

  const { fields, groups, fieldsets } = shapeSchema(
    docName,
    baseFields,
    localCtx
  );

  return {
    name: docName,
    title: t(`${docName}.title`),
    type: 'document',
    groups,
    fieldsets,
    fields
  };
};