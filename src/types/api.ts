export interface ApiOrder {
    id: number;
    createdAt: string; // Las fechas llegan como strings en JSON
    updatedAt: string;
    memoDate: string;
    memoNumber: string;
    requestingUnit: string;
    responsibleOfficial: string;
    concept: string;
    provider: string;
    documentType: string;
    budgetNumber: string;
    budgetDate: string;
    baseAmount: number;
    ivaAmount: number;
    totalAmount: number;
    deliveryTime: string;
    offerQuality: string;
    accountPointDate: string;
    priceInquiryType: string;
    subject: string;
    synthesis: string;
    programmaticCategory: string;
    uel: string;
    status: string;
  }