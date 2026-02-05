import { ITSSchemaDefinition, ITSArrayDefinition } from '../../types';

export const portableText: ITSSchemaDefinition = {
  name: 'portableText',
  type: 'array',
  build: ({ f, builders }) => {
    // return {
    //   of: [
    //     {
    //       type: 'block',
    //       styles: [
    //         { title: 'Normal', value: 'normal' },
    //         { title: 'H2', value: 'h2' },
    //         { title: 'H3', value: 'h3' },
    //       ],
    //       // marks: {
    //       //   annotations: options.allowLinks ? [
    //       //     {
    //       //       name: 'internalLink',
    //       //       type: 'object',
    //       //       title: 'Internal Link',
    //       //       // Recursively call the link builder!
    //       //       fields: createBuilders(f, ctx).internalLink({ 
    //       //         includeDisplayType: false 
    //       //       })
    //       //     }
    //       //   ] : []
    //       // }
    //     },
    //     // f('image', 'baseImage')
    //     { type: 'image' }
    //   ]
    // }
    return builders.portableText({ allowLinks: true })
  }
}
export const portableText2: ITSSchemaDefinition = {
  name: 'portableText',
  type: 'object',
  build: ({ f, builders }) => {
    const bla = {
      fields: [
        // We put the actual Portable Text array inside a field named "content"
        f('content', 'array', {
          of: builders.portableText({ allowLinks: true }).of
        })
      ],
    }

    return bla;
    // return builders.portableText({
    //   allowLinks: true,
    //   // allowImages: true
    // });
    // Define the UNIQUE fields for this module
    // return {
    //   of: [
    //     {
    //       type: 'block',
    //       // Common styles, lists, and marks
    //       styles: [{ title: 'Normal', value: 'normal' }, { title: 'H2', value: 'h2' }],
    //       marks: {
    //         // annotations: [
    //         //   { name: 'link', type: 'object', title: 'Link', fields: [
    //         //     builders.internalLink({ name: 'cta', includeDisplayType: true })
    //         //   ] }
    //         // ]
    //       }
    //     },
    //     // Allow the engine to inject custom "inline" objects like 'youtube' or 'productCard'
    //     { type: 'image' },
    //   ] 
    // };
  }
};