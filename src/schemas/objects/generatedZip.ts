import { ZipIcon } from '../../assets/icons'
import { ITSSchemaDefinition } from '../../types'

/**
 * Auto-managed zip of a set of source assets. Never edited by hand — kept in
 * sync by the `withGeneratedZips` publish wrapper (hash guards regeneration).
 */
export const generatedZip: ITSSchemaDefinition = {
  name: 'generatedZip',
  type: 'object',
  icon: ZipIcon,
  build: (ctx) => {
    const { f } = ctx
    return {
      readOnly: true,
      fields: [
        f('file', 'file', { readOnly: true }),
        // content hash of the source asset ids — guards regeneration
        f('hash', 'string', { hidden: true, readOnly: true }),
        f('generatedAt', 'datetime', {
          readOnly: true,
          options: ctx.format.dateFormat('datetime'),
        }),
        // superseded zip asset ids kept alive so already-deployed (static) links
        // keep resolving until the next site build; trimmed + deleted over time
        f('staleAssetIds', 'array', {
          of: [{ type: 'string' }],
          hidden: true,
          readOnly: true,
        }),
      ],
      preview: {
        select: { filename: 'file.asset.originalFilename', generatedAt: 'generatedAt' },
        prepare: ({ filename, generatedAt }: { filename?: string; generatedAt?: string }) => ({
          title: filename || ctx.t.default('generatedZip.noZip', 'No zip generated yet'),
          subtitle: generatedAt ? new Date(generatedAt).toLocaleString() : undefined,
          media: ZipIcon,
        }),
      },
    }
  },
}
