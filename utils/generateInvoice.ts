import jsPDF from "jspdf";

export const generateInvoice = (
  invoice: any
) => {
  const doc = new jsPDF();

  doc.setFontSize(20);

  doc.text(
    "After Sales CRM Invoice",
    20,
    20
  );

  doc.setFontSize(12);

  doc.text(
    `Customer: ${invoice.customer}`,
    20,
    40
  );

  doc.text(
    `Amount: ₹${invoice.amount}`,
    20,
    50
  );

  doc.text(
    `Status: ${invoice.status}`,
    20,
    60
  );

  doc.save("invoice.pdf");
};