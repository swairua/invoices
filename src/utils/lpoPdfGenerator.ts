import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getColorAsRgbArray } from './colorUtils';

export interface LPOPDFData {
  id: string;
  lpo_number: string;
  lpo_date: string;
  delivery_date?: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  terms_and_conditions?: string;
  delivery_address?: string;
  contact_person?: string;
  contact_phone?: string;
  suppliers?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  lpo_items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    tax_amount: number;
    line_total: number;
    products?: {
      name: string;
      product_code: string;
      unit_of_measure?: string;
    };
  }>;
}

export interface CompanyData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  registration_number?: string;
  tax_number?: string;
  logo_url?: string;
}

export const generateLPOPDF = async (lpo: LPOPDFData, company: CompanyData) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Set font
  doc.setFont('helvetica');

  // Get primary color for branding (default to maroon)
  const primaryColor = (company as any)?.primary_color || '#800000';
  const headerColor = getColorAsRgbArray(primaryColor);

  // Add logo if available (left side of first row)
  if (company.logo_url) {
    try {
      const logoBase64 = await loadImageAsBase64(company.logo_url);
      doc.addImage(logoBase64, 'PNG', 20, yPosition, 80, 40);
      yPosition += 45;
    } catch (error) {
      console.warn('Failed to load logo:', error);
    }
  }

  // Company Header - right aligned in same row as logo
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  const rightColumnX = 120;
  doc.text(company.name, rightColumnX, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let rightY = yPosition;
  if (company.address) {
    doc.text(company.address, rightColumnX, rightY);
    rightY += 5;
  }
  if (company.city || company.country) {
    const location = [company.city, company.country].filter(Boolean).join(', ');
    doc.text(location, rightColumnX, rightY);
    rightY += 5;
  }
  if (company.phone) {
    doc.text(`Phone: ${company.phone}`, rightColumnX, rightY);
    rightY += 5;
  }
  if (company.email) {
    doc.text(`Email: ${company.email}`, rightColumnX, rightY);
    rightY += 5;
  }

  // Adjust yPosition to account for logo height
  yPosition = Math.max(yPosition, 40);

  // Document Title
  yPosition += 10;
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text('LOCAL PURCHASE ORDER', 20, yPosition);
  yPosition += 15;

  // LPO Details (Right side, above supplier info)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const lpoDetailsX = 120;
  let lpoRightY = yPosition;

  doc.text('LPO Number:', lpoDetailsX, lpoRightY);
  doc.setFont('helvetica', 'bold');
  doc.text(lpo.lpo_number, lpoDetailsX + 30, lpoRightY);
  doc.setFont('helvetica', 'normal');
  lpoRightY += 8;

  doc.text('LPO Date:', lpoDetailsX, lpoRightY);
  doc.text(formatDate(lpo.lpo_date), lpoDetailsX + 30, lpoRightY);
  lpoRightY += 8;

  if (lpo.delivery_date) {
    doc.text('Delivery Date:', lpoDetailsX, lpoRightY);
    doc.text(formatDate(lpo.delivery_date), lpoDetailsX + 30, lpoRightY);
    lpoRightY += 8;
  }

  doc.text('Status:', lpoDetailsX, lpoRightY);
  doc.text(lpo.status.toUpperCase(), lpoDetailsX + 30, lpoRightY);

  // Supplier Information (Left side)
  let supplierStartY = yPosition;
  if (lpo.suppliers) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Supplier:', 20, supplierStartY);
    supplierStartY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(lpo.suppliers.name, 20, supplierStartY);
    supplierStartY += 6;

    if (lpo.suppliers.address) {
      doc.text(lpo.suppliers.address, 20, supplierStartY);
      supplierStartY += 6;
    }

    if (lpo.suppliers.city || lpo.suppliers.country) {
      const location = [lpo.suppliers.city, lpo.suppliers.country]
        .filter(Boolean)
        .join(', ');
      doc.text(location, 20, supplierStartY);
      supplierStartY += 6;
    }

    if (lpo.suppliers.phone) {
      doc.text(`Phone: ${lpo.suppliers.phone}`, 20, supplierStartY);
      supplierStartY += 6;
    }

    if (lpo.suppliers.email) {
      doc.text(`Email: ${lpo.suppliers.email}`, 20, supplierStartY);
      supplierStartY += 6;
    }
  }

  yPosition = Math.max(supplierStartY, lpoRightY) + 15;

  // Delivery Information
  if (lpo.delivery_address || lpo.contact_person || lpo.contact_phone) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Information:', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    if (lpo.contact_person) {
      doc.text(`Contact Person: ${lpo.contact_person}`, 20, yPosition);
      yPosition += 6;
    }

    if (lpo.contact_phone) {
      doc.text(`Contact Phone: ${lpo.contact_phone}`, 20, yPosition);
      yPosition += 6;
    }

    if (lpo.delivery_address) {
      doc.text('Delivery Address:', 20, yPosition);
      yPosition += 6;
      const addressLines = lpo.delivery_address.split('\n');
      addressLines.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
    }

    yPosition += 10;
  }

  // Items Table
  if (lpo.lpo_items && lpo.lpo_items.length > 0) {
    const tableColumns = [
      'Item',
      'Description',
      'Qty',
      'Unit Price',
      'Tax %',
      'Tax Amount',
      'Total'
    ];

    const tableRows = lpo.lpo_items.map(item => [
      item.products?.name || 'N/A',
      item.description,
      `${item.quantity} ${item.products?.unit_of_measure || 'pcs'}`,
      formatCurrency(item.unit_price),
      `${item.tax_rate}%`,
      formatCurrency(item.tax_amount),
      formatCurrency(item.line_total)
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        2: { halign: 'center' }, // Quantity
        3: { halign: 'right' },  // Unit Price
        4: { halign: 'center' }, // Tax %
        5: { halign: 'right' },  // Tax Amount
        6: { halign: 'right' },  // Total
      },
    });

    // Get the final Y position after the table
    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    const totalsX = 150;
    doc.setFontSize(10);

    doc.text('Subtotal:', totalsX - 30, yPosition);
    doc.text(formatCurrency(lpo.subtotal), totalsX, yPosition);
    yPosition += 8;

    doc.text('Tax Amount:', totalsX - 30, yPosition);
    doc.text(formatCurrency(lpo.tax_amount), totalsX, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', totalsX - 30, yPosition);
    doc.text(formatCurrency(lpo.total_amount), totalsX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    yPosition += 15;
  }

  // Notes
  if (lpo.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, yPosition);
    yPosition += 4;

    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(lpo.notes, 170);
    doc.setFontSize(9);
    doc.text(noteLines, 20, yPosition);
    yPosition += noteLines.length * 4 + 5;
    doc.setFontSize(10);
  }

  // Terms and Conditions
  if (lpo.terms_and_conditions) {
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 20, yPosition);
    yPosition += 4;

    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(lpo.terms_and_conditions, 170);
    doc.setFontSize(9);
    doc.text(termsLines, 20, yPosition);
    yPosition += termsLines.length * 4 + 5;
    doc.setFontSize(10);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 20, pageHeight - 20);
  doc.text(`Page 1`, 180, pageHeight - 20);

  // Save the PDF
  doc.save(`LPO-${lpo.lpo_number}.pdf`);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const loadImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`Failed to load image from ${imageUrl}: ${error}`);
  }
};
