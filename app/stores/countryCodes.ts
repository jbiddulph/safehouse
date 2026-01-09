import { defineStore } from 'pinia'

export interface CountryCode {
  code: string
  flag: string
  name: string
  example: string
  pattern: RegExp
}

export const useCountryCodesStore = defineStore('countryCodes', () => {
  const countryCodes: CountryCode[] = [
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom', example: '7987654321', pattern: /^\+44\d{10}$/ },
    { code: '+1', flag: '🇺🇸', name: 'United States', example: '5551234567', pattern: /^\+1\d{10}$/ },
    { code: '+1', flag: '🇨🇦', name: 'Canada', example: '5551234567', pattern: /^\+1\d{10}$/ },
    { code: '+61', flag: '🇦🇺', name: 'Australia', example: '412345678', pattern: /^\+61\d{9}$/ },
    { code: '+64', flag: '🇳🇿', name: 'New Zealand', example: '211234567', pattern: /^\+64\d{9}$/ },
    { code: '+27', flag: '🇿🇦', name: 'South Africa', example: '821234567', pattern: /^\+27\d{9}$/ },
    { code: '+33', flag: '🇫🇷', name: 'France', example: '612345678', pattern: /^\+33\d{9}$/ },
    { code: '+49', flag: '🇩🇪', name: 'Germany', example: '15123456789', pattern: /^\+49\d{10,11}$/ },
    { code: '+39', flag: '🇮🇹', name: 'Italy', example: '3123456789', pattern: /^\+39\d{9,10}$/ },
    { code: '+34', flag: '🇪🇸', name: 'Spain', example: '612345678', pattern: /^\+34\d{9}$/ },
    { code: '+31', flag: '🇳🇱', name: 'Netherlands', example: '612345678', pattern: /^\+31\d{9}$/ },
    { code: '+32', flag: '🇧🇪', name: 'Belgium', example: '471234567', pattern: /^\+32\d{9}$/ },
    { code: '+41', flag: '🇨🇭', name: 'Switzerland', example: '791234567', pattern: /^\+41\d{9}$/ },
    { code: '+46', flag: '🇸🇪', name: 'Sweden', example: '701234567', pattern: /^\+46\d{9}$/ },
    { code: '+47', flag: '🇳🇴', name: 'Norway', example: '41234567', pattern: /^\+47\d{8}$/ },
    { code: '+45', flag: '🇩🇰', name: 'Denmark', example: '20123456', pattern: /^\+45\d{8}$/ },
    { code: '+358', flag: '🇫🇮', name: 'Finland', example: '501234567', pattern: /^\+358\d{9}$/ },
    { code: '+353', flag: '🇮🇪', name: 'Ireland', example: '851234567', pattern: /^\+353\d{9}$/ },
    { code: '+351', flag: '🇵🇹', name: 'Portugal', example: '912345678', pattern: /^\+351\d{9}$/ },
    { code: '+30', flag: '🇬🇷', name: 'Greece', example: '6941234567', pattern: /^\+30\d{10}$/ },
    { code: '+48', flag: '🇵🇱', name: 'Poland', example: '512345678', pattern: /^\+48\d{9}$/ },
    { code: '+420', flag: '🇨🇿', name: 'Czech Republic', example: '601123456', pattern: /^\+420\d{9}$/ },
    { code: '+36', flag: '🇭🇺', name: 'Hungary', example: '201234567', pattern: /^\+36\d{9}$/ },
    { code: '+40', flag: '🇷🇴', name: 'Romania', example: '712345678', pattern: /^\+40\d{9}$/ },
    { code: '+7', flag: '🇷🇺', name: 'Russia', example: '9123456789', pattern: /^\+7\d{10}$/ },
    { code: '+86', flag: '🇨🇳', name: 'China', example: '13800138000', pattern: /^\+86\d{11}$/ },
    { code: '+81', flag: '🇯🇵', name: 'Japan', example: '9012345678', pattern: /^\+81\d{10}$/ },
    { code: '+82', flag: '🇰🇷', name: 'South Korea', example: '1012345678', pattern: /^\+82\d{10}$/ },
    { code: '+91', flag: '🇮🇳', name: 'India', example: '9876543210', pattern: /^\+91\d{10}$/ },
    { code: '+971', flag: '🇦🇪', name: 'UAE', example: '501234567', pattern: /^\+971\d{9}$/ },
    { code: '+65', flag: '🇸🇬', name: 'Singapore', example: '91234567', pattern: /^\+65\d{8}$/ },
    { code: '+60', flag: '🇲🇾', name: 'Malaysia', example: '123456789', pattern: /^\+60\d{9,10}$/ },
    { code: '+66', flag: '🇹🇭', name: 'Thailand', example: '812345678', pattern: /^\+66\d{9}$/ },
    { code: '+62', flag: '🇮🇩', name: 'Indonesia', example: '8123456789', pattern: /^\+62\d{9,10}$/ },
    { code: '+55', flag: '🇧🇷', name: 'Brazil', example: '11987654321', pattern: /^\+55\d{11}$/ },
    { code: '+52', flag: '🇲🇽', name: 'Mexico', example: '5512345678', pattern: /^\+52\d{10}$/ },
    { code: '+54', flag: '🇦🇷', name: 'Argentina', example: '91123456789', pattern: /^\+54\d{10,11}$/ },
  ]

  function getCountryByCode(code: string): CountryCode | undefined {
    return countryCodes.find(c => c.code === code)
  }

  function parsePhoneNumber(phoneValue: string): { countryCode: string; number: string } | null {
    if (!phoneValue) return null
    
    // Try to find matching country code (check longer codes first)
    const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length)
    
    for (const country of sortedCodes) {
      if (phoneValue.startsWith(country.code)) {
        return {
          countryCode: country.code,
          number: phoneValue.substring(country.code.length)
        }
      }
    }
    
    return null
  }

  return {
    countryCodes,
    getCountryByCode,
    parsePhoneNumber
  }
})

