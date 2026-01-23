// import { SchemaContext } from '../types'
// import { createFieldFactory } from "../utils/fields";
// import {seo} from './objects/seo'
// import {localeImage} from './objects/localeImage'
// import {shipping} from './objects/shipping'


// export const getCoreObjects = (ctx: SchemaContext) => {
//   const { t, config } = ctx;
//   // Create a factory specifically for objects if needed, 
//   // or just use a generic one.
//   const f = createFieldFactory('', ctx); 

//   return [
//     seo({ t, f, config }),
//     localeImage({ t, f, config }),
//     shipping({ t, f, config }),
//   ];
// };