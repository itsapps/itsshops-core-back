import { ITSDocumentDefinition } from "../../types";
import { Package } from 'phosphor-react'

export const shippingMethod: ITSDocumentDefinition = {
  name: 'shippingMethod',
  type: 'document',
  icon: Package,
  feature: 'shop',
  build: (ctx) => {
    const { f, builders } = ctx;
    return {
      fields: [
        // f('isDefault', 'boolean', { initialValue: false }),
        f('title', 'i18nString', { i18n: 'atLeastOne' }),
        f('methodType', 'string', {
          options: { 
            list: [
              { value: 'delivery' },
              { value: 'pickup' }
            ] 
          },
          initialValue: 'delivery',
          validation: (Rule) => Rule.required()
        }),
        ctx.builders.priceField({
          name: 'pickupFee',
          initialValue: 0,
          hidden: ({ parent }) => parent?.methodType !== 'pickup',
        }),
        f('eligibleCountries', 'array', {
          of: [
            { 
              type: 'reference', 
              to: [{ type: 'taxCountry' }],
              options: { filter: 'enabled == true' } 
            }
          ],
          validation: (Rule) => Rule.required().min(1).unique(),
        }),
        f('rates', 'array', { 
          of: [ { type: 'shippingRate' } ],
          // validation: (Rule) => Rule.required(),
          hidden: ({ parent }) => parent?.methodType === 'pickup',
          validation: (Rule) => Rule.custom((value, context) => {
            const rates = value as unknown[];
            const parent = context.parent as { methodType?: string } | undefined;
            
            // 1. If we don't know the method type yet, don't throw an error
            if (!parent?.methodType) return true;

            // 2. Only enforce rates if it's explicitly 'delivery'
            if (parent.methodType === 'delivery') {
              if (!rates || rates.length === 0) {
                return 'Delivery methods must have at least one weight rate defined.';
              }
            }

            // 3. For everything else (like 'pickup'), it's valid
            return true;
          })
        }),
        f('taxCategory', 'reference', {
          to: [{ type: 'taxCategory' }],
          validation: (Rule) => Rule.required(),
        }),
        f('freeShippingThreshold', 'number', {
          validation: (Rule) => Rule.positive(),
          hidden: ({ parent }) => parent && parent.methodType !== 'delivery',
        }),
      ],
      preview: {
        select: {
          title: 'title',
          countries: 'eligibleCountries',
        },
        prepare({ title, countries }) {
          return {
            title: ctx.localizer.value(title),
            subtitle: ctx.t.default('shippingMethod.preview.countries', 'Countries', { count: countries?.length || 0 }),
          }
        },
      }
    }
  }
};

// Fetching the list of available countries
// const query = `array::unique(*[_type == "shippingMethod"].countries[]) | order(@ asc)`;
// const availableCountries = await client.fetch(query);

// // In your component
// <select name="country">
//   <option value="">Select your country</option>
//   {availableCountries.map((code) => (
//     <option key={code} value={code}>
//       {/* Using a helper like 'intl-list' or a local dictionary 
//           to turn "AT" into "Austria" 
//       */}
//       {getCountryName(code)} 
//     </option>
//   ))}
// </select>



// To determine if a shipment to Austria (AT) is possible, your code needs to "interrogate" your shippingMethod documents. It isn't enough to just check if the country exists; you also have to check if the total weight of the bottles fits within the carrier's limits.
// Here is the logic flow to validate if checkout is possible:
// 1. The Validation Logic
// You should run a check against your Sanity data using three criteria:
// Country Match: Does any shippingMethod include AT in its countries array?
// Weight Capacity: Does that method have a rateTable entry that covers the total weight of the cart?
// Active Status: (Optional) is the method currently enabled?

// The GROQ Query
// This query asks Sanity: "Give me all shipping methods that serve Austria and can carry X kilograms."
// *[_type == "shippingMethod" 
//   && $country in countries 
//   && count(rateTable[maxWeight >= $totalWeight]) > 0
// ] {
//   _id,
//   title,
//   "price": rateTable[maxWeight >= $totalWeight] | order(maxWeight asc)[0].price,
//   freeShippingThreshold
// }


// 4. Pro-Tip: The "Fallback" Pickup Method
// Many wineries in Austria allow "Self-Pickup" (Abholung). You should create one shippingMethod specifically for this:
// Title: "Pick up at Winery"
// Countries: ['AT']
// Rate Table: [{ maxWeight: 9999, price: 0 }]
// This ensures that even if an order is too heavy for a courier, the "AT" checkout is still possible via pickup, preventing a lost sale.