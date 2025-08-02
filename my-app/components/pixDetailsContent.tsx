'use client'

import React, { useState, useEffect } from "react"
import { Copy, QrCode as QrCodeIcon, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"


export default function PixDetailsContent() {
  const searchParams = useSearchParams();

  const qrCode = searchParams.get('qrCode') || '';
  const qrCodeBase64 = searchParams.get('qrCodeBase64') || '';
  const purchaseId = searchParams.get('purchaseId') || '';

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (qrCode) {
      toast({
        title: "PIX gerado!",
        description: "Agora é só escanear ou copiar o código para pagar.",
      });
    } else {
      toast({
        title: "Erro no PIX",
        description: "Não foi possível gerar o QR Code. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  }, [qrCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Código PIX Copia e Cola copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    
    <Card className="max-w-xl mx-auto text-center p-8 shadow-lg">
      <CardHeader className="pb-4">
        <QrCodeIcon className="h-20 w-20 text-purple-600 mx-auto mb-4" />
        <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-700">
          Pague com PIX
        </CardTitle>
        <p className="text-gray-600 text-base">
          Escaneie o QR Code ou copie o código abaixo para finalizar o pagamento.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {qrCodeBase64 ? (
          <div className="relative w-48 h-48 mx-auto border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code PIX" className="w-full h-full object-contain p-2" />
          </div>
        ) : (
          <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
            <p className="text-gray-400 text-sm ml-2">Gerando QR Code...</p>
          </div>
        )}

        {qrCode && (
          <div className="space-y-2">
            <Label htmlFor="pix-code" className="text-lg font-semibold">Código PIX Copia e Cola:</Label>
            <div className="flex gap-2">
              <Input
                id="pix-code"
                type="text"
                value={qrCode}
                readOnly
                className="flex-1 bg-gray-100 text-gray-800 border-gray-300 select-all"
              />
              <Button onClick={handleCopy} className="bg-purple-600 hover:bg-purple-700" disabled={copied}>
                {copied ? "Copiado!" : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500">
          O pagamento via PIX é instantâneo. Assim que confirmado, você receberá um e-mail com o acesso aos seus produtos.
        </p>
      </CardContent>
    </Card >
  );
}
