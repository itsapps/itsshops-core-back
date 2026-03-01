import { Dialog } from '@sanity/ui'
import { useEffect, useState } from 'react'

import { CreateProductFromWines } from '../../components/products/CreateProductFromWines'

export function ImportWinesAction(props) {
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
