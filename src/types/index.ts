// Re-export everything from the sub-files
export * from './config';
export * from './localization';
export * from './schema';

// Define the "Toolbox" type to clean up factory signatures
import { TranslatorFunction, StrictTranslatorFunction } from './localization';
import { CoreBackConfig } from './config';
import { FieldFactory } from './schema';

/** The standard bundle of tools passed to every schema and extension */
export interface SchemaContext {
  t: TranslatorFunction;
  tStrict: StrictTranslatorFunction;
  config: CoreBackConfig;
}

export interface LocalSchemaContext extends SchemaContext {
  f: FieldFactory;
}