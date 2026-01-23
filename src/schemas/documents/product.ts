import { SchemaContext, LocalSchemaContext } from "../../types";
import { createFieldFactory, shapeSchema } from "../../utils";
import { createSharedProductFields } from "../productAndVariantFields";
import { PriceInput } from "../../components/PriceInput";
import { GenerateVariants } from "../../components/GenerateVariants";

export const createProductSchema = (ctx: SchemaContext) => {
  const docName = 'product';
  const { t } = ctx;
  const f = createFieldFactory(docName, ctx);
  const localCtx: LocalSchemaContext = { ...ctx, f };
  // const baseFields = [
  //   { name: 'title', type: 'string', title: translator('product.fields.title.title') },
  //   { name: 'slug', type: 'slug', title: translator('product.fields.slug.title') }
  // ];
  const baseFields = [
    f('title', 'i18nString', { i18n: 'atLeastOne' }),
    // f('title', 'i18nString', { i18n: 'atLeastOne', group: 'product', }),
    f('price', 'number', {
      validation: (Rule) => Rule.positive().required(),
      // group: 'pricing',
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
      // group: 'variants',
      // components: {
      //   input: GenerateVariants
      // },
    }),
    // f('i18nTitel', 'number', { validation: (Rule) => Rule.required().min(3) }),
    // f('i18nTitel', 'i18nString', { i18n: ['atLeastOne', { min: 3, warning: false }] }),
    // f('i18nTitel', 'i18nString', { i18n: ['requiredDefault', { min: 3, warning: false }] }),
    // f('i18nTitel', 'i18nString', { i18n: ['requiredDefault', { min: 3, warning: true }] }),
    // f('i18nTitel222', 'i18nString', { i18n: 'atLeastOneWarning' }),
    ...createSharedProductFields(localCtx),
    // f('n18nRequiredTitel', 'string', { validation: (Rule) => Rule.required() }),
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