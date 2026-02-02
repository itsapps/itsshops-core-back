import { CoreObject, FieldContext } from '../../types';

export const localeComplexPortable: CoreObject = {
  name: 'localeComplexPortable',
  build: (ctx: FieldContext) => {
    return {
      type: 'object',
      fields: [
        ctx.f('content', 'string')
      ],
      preview: {
        select: {
          block: 'content',
        },
        prepare({ block }: any) {
          const l = ctx.localizer.value(block) as Array<any> | undefined;
          const title = l?.[0]?.children?.[0]?.text
          return {
            title: title || "nix",
          };
        }
      }
    }
  }
}