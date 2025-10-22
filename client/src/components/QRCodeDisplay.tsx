import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCode: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCode, size = 200 }) => {
  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'invitation-qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">QR Code</h4>
          <div className="flex justify-center">
            <img 
              src={qrCode} 
              alt="Invitation QR Code" 
              className="border rounded-lg"
              style={{ width: size, height: size }}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadQRCode}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download QR Code
          </Button>
          <p className="text-xs text-gray-600">
            Share this QR code for easy invitation acceptance
          </p>
        </div>
      </CardContent>
    </Card>
  );
};