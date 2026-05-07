import axios from "axios";

const ERP_BASE_URL =
  process.env.ERP_BASE_URL;

const ERP_API_KEY =
  process.env.ERP_API_KEY;

export const erpClient = axios.create({
  baseURL: ERP_BASE_URL,

  headers: {
    Authorization: `Bearer ${ERP_API_KEY}`,
  },
});

export async function syncCustomerToERP(
  customer: any
) {
  return erpClient.post(
    "/customers",
    customer
  );
}

export async function syncInvoiceToERP(
  invoice: any
) {
  return erpClient.post(
    "/invoices",
    invoice
  );
}