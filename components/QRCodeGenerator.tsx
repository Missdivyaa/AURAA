'use client'

import React, { useState, useRef } from 'react'
import { Download, Copy, QrCode } from 'lucide-react'

interface QRCodeGeneratorProps {
  data: string
  title?: string
  size?: number
}

export default function QRCodeGenerator({ 
  data, 
  title = "QR Code", 
  size = 200 
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQRCode = async () => {
    try {
      // Using a simple QR code generation service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const copyData = () => {
    navigator.clipboard.writeText(data)
    // You could add a toast notification here
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <QrCode className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Data to encode:</p>
          <p className="font-mono text-sm break-all">{data}</p>
        </div>

        <button
          onClick={generateQRCode}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate QR Code
        </button>

        {qrCodeUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="border border-gray-200 rounded-lg"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={copyData}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


