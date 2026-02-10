
type Response = Promise<{
  error: any;
  data?: undefined;
} | {
  data: any;
  error?: undefined;
}>

export type ITSFrontendClient = {
  sendMail: (mailType: string, orderId: string) => Response;
  sendRefund: (paymentIntentId: string, options?: {
      amount?: number | undefined;
  }) => Response;
  getOrderInvoicePdf: (orderId: string) => Response;
  getExportXlsx: (kind: string) => Response;
}
