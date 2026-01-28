import { CoreObject, FieldContext } from '../../types';

export const localeComplexPortable: CoreObject = {
  name: 'localeComplexPortable',
  type: 'object',
  build: (ctx: FieldContext) => {
    return {
      fields: [
        ctx.f('content', 'i18nBlock')
      ],
      preview: {
        select: {
          block: 'content',
        },
        prepare({ block }: any) {
          const l = ctx.helpers.localizer.value(block) as Array<any> | undefined;
          const title = l?.[0]?.children?.[0]?.text
          return {
            title: title || "nix",
          };
        }
      }
    }
  }
}