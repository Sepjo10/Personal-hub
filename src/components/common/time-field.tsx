"use client";

import { useState } from "react";
import { fieldClass } from "./modal";

/**
 * Campo de hora en formato 24 h (HH:MM). El <input type="time"> nativo muestra
 * AM/PM si el navegador está en inglés; este campo siempre usa 24 h.
 * Al escribir "1730" se formatea solo como "17:30".
 */
export function TimeField({ name, id, defaultValue }: { name: string; id?: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setValue(digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits);
  }

  return (
    <input
      id={id}
      name={name}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      inputMode="numeric"
      placeholder="HH:MM"
      pattern="([01]\d|2[0-3]):[0-5]\d"
      title="Hora en formato 24 h, por ejemplo 17:30"
      maxLength={5}
      className={`${fieldClass} tabular-nums`}
    />
  );
}
