import { UsersIcon } from '@sanity/icons'
import { ITSSchemaDefinition } from "../../types";


export const customerGroup: ITSSchemaDefinition = {
  name: 'customerGroup',
  type: 'document',
  icon: UsersIcon,
  feature: 'users',
  build: (ctx) => {
    const { f } = ctx;
    return {
      fields: [
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
      ]
    }
  }
};
