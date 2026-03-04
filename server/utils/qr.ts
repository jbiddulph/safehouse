import QRCode from 'qrcode'

export function normalizeBaseUrl(baseUrl?: string) {
  const fallback = 'https://mysafehouse.co.uk'
  const value = (baseUrl || fallback).trim()
  return value.replace(/\/+$/, '')
}

export function buildPropertyUrl(baseUrl: string, propertyId: string) {
  return `${normalizeBaseUrl(baseUrl)}/property/${propertyId}`
}

export function buildNfcUrl(baseUrl: string, nfcCode: string) {
  return `${normalizeBaseUrl(baseUrl)}/nfc/${encodeURIComponent(nfcCode)}`
}

export async function generateQrDataUrl(targetUrl: string, width = 220) {
  return QRCode.toDataURL(targetUrl, {
    width,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })
}
