import React, { useState, useEffect } from "react";
import { TextInput } from "@sanity/ui";
import { useCurrentLocale, set, unset, NumberInputProps } from "sanity";
import {formatCurrency} from '../utils'

function getSeparators(locale: string) {
  const parts = Intl.NumberFormat(locale).formatToParts(1234.5);
  const decimal = parts.find((p) => p.type === "decimal")?.value || ".";
  const group = parts.find((p) => p.type === "group")?.value || ",";
  return { decimal, group };
}

export const PriceInput = ({ value, onChange, ...props }: NumberInputProps) => {
  const locale = useCurrentLocale().id.substring(0, 2)
  const { decimal: decimalSep, group: groupSep } = getSeparators(locale);

  // Internal state for raw input (for a smooth editing experience)
  const [editValue, setEditValue] = useState<string>(() => {
    if (typeof value === "number") {
      return formatCurrency(locale, value/100);
    }
    return "";
  });
  const [focused, setFocused] = useState(false);

  // Reset editValue if value changes outside (e.g. undo, reload, etc). Only update if not focused.
  useEffect(() => {
    if (!focused) {
      if (typeof value === "number") {
        setEditValue(formatCurrency(locale, value/100));
      } else {
        setEditValue("");
      }
    }
  }, [value, locale, focused]);

  // Helper: parse input string to cents
  function parseRawToCents(raw: string): number | undefined {
    let normalized = raw.split(groupSep).join("");
    if (decimalSep !== ".") normalized = normalized.replace(decimalSep, ".");
    if (!normalized.match(/\d/)) return undefined;
    const float = parseFloat(normalized);
    if (!isNaN(float)) return Math.round(float * 100);
    return undefined;
  }

  // Handle user typing
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.currentTarget.value;
    setEditValue(raw);

    // Only patch if input is a number (not just separator or empty)
    const cents = parseRawToCents(raw);
    if (typeof cents === "number" && raw.trim() !== "") {
      onChange(set(cents));
    } else if (raw.trim() === "") {
      onChange(unset());
    }
    // Otherwise, don't patch (invalid input in progress)
  }

  // On blur, format nicely
  function handleBlur() {
    setFocused(false);
    if (typeof value === "number") {
      setEditValue(formatCurrency(locale, value/100));
    } else {
      setEditValue("");
    }
  }

  // On focus, show raw edit
  function handleFocus() {
    setFocused(true);
  }

  return (
    <TextInput
      {...props.elementProps}
      customValidity=""
      inputMode="decimal"
      value={editValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={`0${decimalSep}00`}
    />
  );
}