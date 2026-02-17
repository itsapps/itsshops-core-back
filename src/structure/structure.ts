import { 
  ListItemBuilder, 
  StructureBuilder, 
  StructureResolverContext 
} from 'sanity/structure';
import { isDev } from 'sanity';

import type { ITSContext, ITSStructureItem } from '../types';

export const localizedStructure = (ctx: ITSContext, coreManifest: ITSStructureItem[]) => {
  return (S: StructureBuilder, context: StructureResolverContext) => {

    // 2. Combine and Sort
    const customerManifest = ctx.config.structure || [];
    // 1. Merge (to allow overrides like changing position)
    const mergedManifest = mergeManifests(coreManifest, customerManifest);
    const fullManifest = sortItems(mergedManifest);

    // 3. Resolve to Sanity UI
    const items = fullManifest
      .map(item => resolveItem(item, S, context, ctx))
      .filter(Boolean);

    return S.list()
      .id('root')
      .title(ctx.t.default('content'))
      .items([
        ...items,
        // S.documentTypeListItem('bla').title('pages'),
      ]);
  };
};

export const fromRegistry = (ctx: ITSContext, id: string): ITSStructureItem => {
  const doc = ctx.featureRegistry.getDoc(id);

  if (!doc) {
    // Fallback for custom items not in registry
    return { type: 'document', id, hidden: false };
  }

  const extension = ctx.config.schemaExtensions?.[id];
  const icon = extension?.icon ?? doc.icon;

  return {
    type: doc.isSingleton ? 'singleton' : 'document',
    id: doc.name,
    icon,
    feature: doc.feature,
    hidden: doc.hideInStructure,
  };
};
export const isDocHidden = (ctx: ITSContext, id: string): boolean => {
  const doc = ctx.featureRegistry.getDoc(id);

  if (!doc) {
    return false;
  }

  return doc.hideInStructure || false;
};

const sortItems = (items: ITSStructureItem[]): ITSStructureItem[] => {
  // 1. Separate items by their basic positioning intent
  const topItems = items.filter(i => i.position?.anchor === 'top');
  const bottomItems = items.filter(i => i.position?.anchor === 'bottom');
  
  // These are items that don't have a specific anchor or are the "standard" core items
  const baseItems = items.filter(i => !i.position?.anchor);
  
  // These are the items trying to "hook" onto a specific ID
  const anchoredItems = items.filter(
    i => i.position?.anchor && !['top', 'bottom'].includes(i.position.anchor)
  );

  // 2. Start our sorted list with Top + Base items
  let sorted = [...topItems, ...baseItems];

  // 3. Iteratively place anchored items (handles dependencies)
  let remaining = [...anchoredItems];
  let changed = true;

  while (changed && remaining.length > 0) {
    changed = false;
    remaining = remaining.filter(item => {
      const anchorIndex = sorted.findIndex(s => s.id === item.position?.anchor);
      
      if (anchorIndex !== -1) {
        const insertAt = item.position?.placement === 'before' ? anchorIndex : anchorIndex + 1;
        sorted.splice(insertAt, 0, item);
        changed = true;
        return false; // Remove from remaining, it's now sorted
      }
      return true; // Keep in remaining for next pass
    });
  }

  // 4. Fallback: If any items have invalid anchors, append them before the bottom items
  // This ensures a typo in 'anchor: "shopp"' doesn't delete the document from the UI
  return [...sorted, ...remaining, ...bottomItems];
};

const resolveItem = (
  item: ITSStructureItem, 
  S: StructureBuilder, 
  context: StructureResolverContext, 
  ctx: ITSContext
): ListItemBuilder | any | null => {
  /// 1. Feature Guard
  if (item.feature && !ctx.featureRegistry.isFeatureEnabled(item.feature)) return null;
  if (item.type === 'document' && !ctx.featureRegistry.isDocEnabled(item.id)) return null;
  // if (item.hidden) return null;
  if (item.hidden && !isDev) return null;

  const t = ctx.t.default;
  const title = item.title ? t(item.title) : t(item.id);

  switch (item.type) {
    case 'divider':
      return S.divider();

    case 'singleton': {
      // Safety: check if the schema type exists in Sanity
      const schemaExists = context.schema.has(item.id);
      if (!schemaExists) {
        console.warn(`Structure Error: Schema type "${item.id}" not found for singleton.`);
        return null;
      }
      
      return S.listItem()
        .title(title)
        .icon(item.icon)
        .child(S.editor().id(item.id).schemaType(item.id).documentId(item.id));
    }
    case 'group': {
      const sorted = sortItems(item.children || []);
      const resolved = sorted
        .map(c => resolveItem(c, S, context, ctx))
        .filter(Boolean);

      // If the group is empty (no enabled features/docs), hide the group entirely
      if (resolved.length === 0) return null;

      return S.listItem()
        // .id(item.id)
        .title(title)
        .icon(item.icon)
        .child(
          S.list()
            .id(item.id)
            .title(title)
            .items(resolved)
        );
    }
    case 'custom': {
      return item.component?.(S, context, ctx);
    }
    // document
    default: {
      // if (item.id === 'product') {
      //   return S.listItem()
      //     // .id(item.id)
      //     .title(title)
      //     .icon(item.icon)
      //     .child(
      //       S.list()
      //         .id(item.id)
      //         .title(title)
      //         .items([
      //           S.listItem({
      //             id: 'product-price',
      //             title: 'Books by author',
      //             schemaType: 'product',
      //             child: () =>
      //               S.documentTypeList('product').child(price =>
      //                 S.documentTypeList('product')
      //                   .title('Books by author')
      //                   .filter('_type == $type && price == $price')
      //                   .params({type: 'product', price})
      //                   .initialValueTemplates([
      //                     S.initialValueTemplateItem('product-price', {price})
      //                   ])
      //               )
      //           }),
      //           // ...S.documentTypeListItems()
      //         ])
      //     );
      // }
      return S.documentTypeListItem(item.id).title(title).icon(item.icon);
      // return S.documentTypeListItem(item.id)
      //   .title(title)
      //   .icon(item.icon)
      //   .child(
      //     S.documentTypeList(item.id)
      //       .title(title)
      //       // This is the missing piece:
      //       // .initialValueTemplates([
      //       //   S.initialValueTemplateItem('product-with-title'),
      //       //   S.initialValueTemplateItem('product-price'),
      //       //   // S.initialValueTemplateItem('product-price', { price: 100 }),
      //       // ])
      //   );
    }
  }
};

const mergeManifests = (core: ITSStructureItem[], customer: ITSStructureItem[]): ITSStructureItem[] => {
  const merged = [...core];

  customer.forEach((customItem) => {
    const coreIndex = merged.findIndex((i) => i.id === customItem.id);
    
    if (coreIndex !== -1) {
      const coreItem = merged[coreIndex];
      
      // If BOTH have children, we need to merge the children arrays too
      if (coreItem.children && customItem.children) {
        merged[coreIndex] = {
          ...coreItem,
          ...customItem,
          children: mergeManifests(coreItem.children, customItem.children) // Recursive merge!
        };
      } else {
        // Otherwise, standard overwrite (for position, icon, etc.)
        merged[coreIndex] = { ...coreItem, ...customItem };
      }
    } else {
      merged.push(customItem);
    }
  });

  return merged;
};