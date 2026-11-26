import { Button, Stack } from '@sanity/ui'
import { ReactElement, ReactNode, useCallback, useId, useState } from 'react'

import { ChevronRightIcon, DisclosureOpenIcon } from '../../../../assets/icons'
import { useITSContext } from '../../../../context/ITSCoreProvider'

interface AdvancedSectionProps {
  /** How many values inside are set — shown on the toggle so a chosen value is never hidden. */
  setCount?: number
  children: ReactNode
}

/**
 * Collapsed "Advanced" disclosure. The content stays mounted while collapsed (`hidden`), so
 * typed values are kept.
 */
export function AdvancedSection({ setCount = 0, children }: AdvancedSectionProps): ReactElement {
  const { componentT } = useITSContext()
  const [expanded, setExpanded] = useState(false)
  const contentId = useId()
  const toggle = useCallback(() => setExpanded((prev) => !prev), [])

  const label = componentT.default('productCreatorTool.advanced')
  return (
    <Stack gap={3}>
      <Button
        mode="bleed"
        padding={2}
        justify="flex-start"
        icon={expanded ? DisclosureOpenIcon : ChevronRightIcon}
        text={setCount > 0 ? `${label} (${setCount})` : label}
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={toggle}
        style={{ alignSelf: 'flex-start' }}
      />
      <div id={contentId} hidden={!expanded}>
        {children}
      </div>
    </Stack>
  )
}
