"use client"

import { useState } from "react"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"

interface Props {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function PhoneInputField({ value, onChange, error }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-gray-600 font-semibold mb-1 text-sm">
        Téléphone *
      </label>
      <div className={`bg-gray-50 border rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 ${
        error ? "border-red-400" : "border-gray-200"
      }`}>
        <PhoneInput
          international
          defaultCountry="CM"
          value={value}
          onChange={(val) => onChange(val ?? "")}
          className="text-sm outline-none bg-transparent"
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}