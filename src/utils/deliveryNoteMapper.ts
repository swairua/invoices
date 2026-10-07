import { DeliveryNote } from '@/hooks/useDatabase';

// Maps real database delivery_note_number to frontend delivery_note_number.
// The live DB column is delivery_note_number (no separate delivery_number).
export const mapDeliveryNoteForDisplay = (deliveryNote: DeliveryNote & any) => {
  return {
    ...deliveryNote,
    delivery_note_number: deliveryNote.delivery_note_number || deliveryNote.delivery_number,
    invoice_number: deliveryNote.invoices?.invoice_number || deliveryNote.invoice_number,
  };
};

// Keep the real database column name (delivery_note_number) when saving.
// UI-only fields (delivery_address, tracking_number, etc.) are dropped
// server-side by the schema-aware write filter.
export const mapDeliveryNoteForDatabase = (deliveryNote: any) => {
  return deliveryNote;
};
