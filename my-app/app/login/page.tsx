"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const callbackUrl = "/";
  
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl); // navega pós-render
    }
  }, [status, router, callbackUrl]);

  async function signInProfile() {
    await signIn();
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-zinc-200 p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-1 text-sm text-zinc-500">Acesse sua conta para baixar seus e‑books</p>
        </div>

        {/* OAuth */}
        <div className="flex flex-col gap-2">
          <button
            onClick={signInProfile}
            className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm transition hover:bg-zinc-50"
          >
            Continuar com Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Ao continuar, você concorda com nossos <a href="/politicas" className="underline">Termos</a> e <a href="/politicas" className="underline">Política de Privacidade</a>.
        </p>
      </div>
    </main>
  );
}
