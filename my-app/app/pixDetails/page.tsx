import React, { Suspense } from 'react';
import PixDetailsContent from '../../components/pixDetailsContent';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Loader2 } from 'lucide-react';

export default function PixDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />

      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-150px)]">
        {/*
          O Suspense é essencial para garantir que o 'useSearchParams'
          não cause erros de prerendering. Ele renderiza o fallback no
          servidor e o conteúdo real no cliente.
        */}
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
              <p className="text-gray-400 text-sm ml-2">Gerando QR Code...</p>
            </div>
          </div>
        }>
          <PixDetailsContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}