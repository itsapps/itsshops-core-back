import { Rule } from 'sanity';
import { TranslatorFunction } from "../types";

interface ValidatorContext {
  t: TranslatorFunction;
  docName: string;
  fieldName: string;
}

export const i18nValidators = {
  /** 1 & 5: Required (or Warning) for the Default Locale */
  requiredDefault: (defaultLocale: string, isRequired: boolean, ctx: ValidatorContext) => (rule: Rule) => {
    const customRule = rule.custom((value: any[]) => {
      const entry = value?.find(item => item._key === defaultLocale);
      if (!entry?.value) {
        return ctx.t('validation.requiredDefault', 'validation.requiredDefault', { locale: defaultLocale });
      }
      return true;
    });
    return isRequired ? customRule.error() : customRule.warning();
  },

  /** 2: All defined locales are required */
  requiredAll: (allLocales: string[], ctx: ValidatorContext) => (rule: Rule) => {
    return rule.custom((value: any[]) => {
      const missing = allLocales.filter(
        lang => !value?.find(item => item._key === lang)?.value
      );
      return missing.length === 0 
        ? true 
        : ctx.t('validation.requiredAll', 'validation.requiredAll', { missing: missing.join(', ') });
    }).error();
  },

  /** 3 & 4: At least one (any) exists */
  atLeastOneExists: (isRequired: boolean, ctx: ValidatorContext) => (rule: Rule) => {
    const { t, docName, fieldName } = ctx;
    const fieldLabel = t(`${docName}.fields.${fieldName}.title`);
    const customRule = rule.custom((value: any[]) => {
      const hasValue = value?.some((item) => !!item.value);
      if (!hasValue) {
        return {
          message: t('validation.oneFieldMustExist', 'validation.oneFieldMustExist', { field: fieldLabel }),
          // Leaving 'path' out here targets the field itself
        };
      }
      return true;
    });
    return isRequired ? customRule.error() : customRule.warning();
    // const customRule = rule.custom((value: any[]) => {
    //   const hasValue = value?.some((item) => !!item.value);
    //   if (!hasValue) return ctx.t('validation.oneFieldMustExist');
    //   return true;
    // });
    // return isRequired ? customRule.error() : customRule.warning();
  },

  /** 6: Min/Max character limits with specific input highlighting */
  contentLimits: (limits: { min?: number; max?: number; warning?: boolean }, ctx: ValidatorContext) => (rule: Rule) => {
    const { min, max, warning } = limits;
    
    const customRule = rule.custom((value: any[]) => {
      if (!value || value.length === 0) return true;

      const invalidItems = value.filter(item => {
        if (!item.value) return false;
        const len = String(item.value).length;
        if (min && len < min) return true;
        if (max && len > max) return true;
        return false;
      });

      if (invalidItems.length > 0) {
        const message = min && !max
          ? ctx.t('validation.minLength', 'validation.minLength', { min })
          : ctx.t('validation.maxLength', 'validation.maxLength', { max: max || 9999 }) 

        // This is the key: returning an array of path-specific errors
        if (warning) {
          return message
        } else {
          return invalidItems.map((item) => ({
            message,
            // This tells Sanity: "The error is inside the item with _key 'en' in the 'value' property"
            path: [{ _key: item._key }, 'value'],
          }));
        }
        
      }
      return true;
    });
    return warning ? customRule.warning() : customRule.error();

    // const { min, max, warning } = limits;
    // const customRule = rule.custom((value: any[]) => {
    //   if (!value) return true;
    //   const invalidItems = value.filter(item => {
    //     if (!item.value) return false;
    //     if (min && item.value.length < min) return true;
    //     if (max && item.value.length > max) return true;
    //     return false;
    //   });

    //   if (invalidItems.length > 0) {
    //     const message = max 
    //       ? ctx.t('validation.maxLength', { max }) 
    //       : ctx.t('validation.minLength', { min });

    //     // Highlighting the specific locale input that failed
    //     return invalidItems.map((item) => ({
    //       message,
    //       path: [{ _key: item._key }, 'value'],
    //     }));
    //   }
    //   return true;
    // });
    // return warning ? customRule.warning() : customRule.error();
  }
  // atLeastOneExists: (context: { t: TranslatorFunction; fieldName: string; docName: string; isRequired: boolean }) => {
  //   const { t, fieldName, docName, isRequired } = context;
    
  //   return (rule: Rule) => {
  //     const customRule = rule.custom<{value: string; _key: string}[]>((value) => {
  //       const hasValue = value?.some((item) => item.value != null && item.value !== '');
        
  //       if (!hasValue) {
  //         // Use the translator to get a nice field name and message
  //         const fieldLabel = t(`${docName}.fields.${fieldName}.title`);
  //         return t('validation.oneFieldMustExist', { field: fieldLabel });
  //       }
  //       return true;
  //     });

  //     // Apply the severity based on the 'required' flag
  //     return isRequired ? customRule.error() : customRule.warning();
  //   };
  // },
  // maxLength: (max: number, context: { t: any; docName: string; fieldName: string; isRequired: boolean }) => {
  //   const { t, docName, fieldName, isRequired } = context;

  //   return (rule: Rule) => {
  //     const customRule = rule.custom<{ value: string; _key: string }[]>((value) => {
  //       if (!value || value.length === 0) return true;

  //       const invalidItems = value.filter(
  //         (item) => item.value != null && item.value.length > max
  //       );

  //       if (invalidItems.length > 0) {
  //         const fieldLabel = t(`${docName}.fields.${fieldName}.title`, fieldName);
  //         const message = t('validation.maxLength', { max, field: fieldLabel });

  //         // If required (Error), we point to specific locale inputs
  //         if (isRequired) {
  //           return invalidItems.map((item) => ({
  //             message,
  //             path: [{ _key: item._key }, 'value'], // Highlights the specific input
  //           }));
  //         }
  //         // If not required (Warning), we return a general message for the field
  //         return message;
  //       }

  //       return true;
  //     });

  //     return isRequired ? customRule.error() : customRule.warning();
  //   };
  // }
};