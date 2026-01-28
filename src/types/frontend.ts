
type FrontendClientFunctionReturnType = {
  error: any;
  data?: undefined;
} | {
  data: any;
  error?: undefined;
}

export type ITSFrontendClient = {
  sendMail: (mailType: string, orderId: string) => Promise<FrontendClientFunctionReturnType>;
  sendRefund: (paymentIntentId: string, options?: {
      amount?: number | undefined;
  }) => Promise<FrontendClientFunctionReturnType>;
  getOrderInvoicePdf: (orderId: string) => Promise<FrontendClientFunctionReturnType>;
  getExportXlsx: (kind: string) => Promise<FrontendClientFunctionReturnType>;
}
