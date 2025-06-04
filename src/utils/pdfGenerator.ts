import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Quote, QuoteItem } from '../types/customer';

export const generateQuotePDF = (quote: Quote, items: QuoteItem[]) => {
  const doc = new jsPDF();

  // Configuración inicial
  doc.setFont('helvetica');
  doc.setFontSize(20);
  doc.text('Cotización', 105, 20, { align: 'center' });

  // Información de la cotización
  doc.setFontSize(12);
  doc.text(`Número: ${quote.quote_number}`, 20, 40);
  doc.text(`Fecha: ${new Date(quote.created_at).toLocaleDateString()}`, 20, 50);
  doc.text(`Válida hasta: ${new Date(quote.valid_until || '').toLocaleDateString()}`, 20, 60);

  // Información del cliente
  if (quote.customer) {
    doc.setFontSize(14);
    doc.text('Cliente', 20, 80);
    doc.setFontSize(12);
    doc.text(`Nombre: ${quote.customer.name}`, 20, 90);
    if (quote.customer.company) doc.text(`Empresa: ${quote.customer.company}`, 20, 100);
    if (quote.customer.email) doc.text(`Email: ${quote.customer.email}`, 20, 110);
    if (quote.customer.phone) doc.text(`Teléfono: ${quote.customer.phone}`, 20, 120);
  }

  // Tabla de productos
  const tableData = items.map(item => [
    item.product?.name || '',
    item.quantity.toString(),
    `$${item.unit_price.toFixed(2)}`,
    `$${item.total_price.toFixed(2)}`
  ]);

  (doc as any).autoTable({
    startY: quote.customer ? 140 : 80,
    head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [17, 3, 99] },
  });

  // Totales
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Subtotal: $${quote.subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`IVA (${(quote.tax_rate * 100).toFixed(0)}%): $${quote.tax_amount.toFixed(2)}`, 140, finalY + 10);
  doc.text(`Total: $${quote.total_amount.toFixed(2)}`, 140, finalY + 20);

  // Notas
  if (quote.notes) {
    doc.setFontSize(14);
    doc.text('Notas:', 20, finalY + 40);
    doc.setFontSize(12);
    doc.text(quote.notes, 20, finalY + 50);
  }

  return doc;
};