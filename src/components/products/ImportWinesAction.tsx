import { Dialog } from '@sanity/ui'
import { useEffect, useState } from 'react'

import { CreateProductFromWines } from './CreateProductFromWines'
import { VinofactWine } from '../../types'

type WineImportDialogProps = {
  // buttonText: string
  // buttonIcon?: React.ComponentType
  // dialogHeader: string
  // confirmButtonText: (count: number) => string
  // This is the key: pass the logic in here
  onConfirm: (selectedWines: VinofactWine[]) => Promise<void>
}

export function ImportWinesAction(props: any) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return {
    name: 'importWines',
    id: 'importWines',
    label: 'actions.order.updateStatus.title',
    // icon: CheckCircle,
    // disabled: fulfillmentActions.length === 0 && paymentActions.length === 0,
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen && {
      type: 'dialog',
      header: 'actions.order.updateStatus.title',
      onClose: () => setDialogOpen(false),
      content: <div>blabla</div>,
    },
  }
}

// export function ImportWinesAction() {
//   const [open, setOpen] = useState(true)

//   // useEffect(() => {
//   //   setOpen(true)
//   // }, [])

//   return (
//     <Dialog header="Import Wines" id="wine-import-dialog" width={1} onClose={() => setOpen(false)}>
//       <CreateProductFromWines />
//     </Dialog>
//   )
// }
