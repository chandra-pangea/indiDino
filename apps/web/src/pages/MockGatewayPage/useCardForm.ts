// Custom hook holding the mock card form state, formatting, and client-side validation.
import { useState } from 'react';

// The shape of the card form fields.
interface CardFields {
  cardholder: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

// Starts the form prefilled with a well-known test card so the demo is one click away.
const TEST_CARD: CardFields = {
  cardholder: 'Test Player',
  cardNumber: '4242 4242 4242 4242',
  expiry: '12/30',
  cvc: '123',
};

// Groups raw digits into 4-digit blocks for display.
function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

// Formats expiry input as MM/YY.
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

// Exposes the card fields, setters, validation errors, and a validity flag.
export function useCardForm() {
  const [fields, setFields] = useState<CardFields>(TEST_CARD);

  // Updates one field, applying formatting for the card number and expiry.
  const setField = (name: keyof CardFields, value: string) => {
    const formatted = name === 'cardNumber' ? formatCardNumber(value) : name === 'expiry' ? formatExpiry(value) : value;
    setFields((current) => ({ ...current, [name]: formatted }));
  };

  // Computes per-field validation errors (basic shape checks only — this is a mock).
  const errors = {
    cardholder: fields.cardholder.trim() ? '' : 'Required',
    cardNumber: fields.cardNumber.replace(/\s/g, '').length === 16 ? '' : 'Enter 16 digits',
    expiry: /^\d{2}\/\d{2}$/.test(fields.expiry) ? '' : 'MM/YY',
    cvc: /^\d{3}$/.test(fields.cvc) ? '' : '3 digits',
  };

  const isValid = Object.values(errors).every((error) => error === '');

  return { fields, setField, errors, isValid };
}
