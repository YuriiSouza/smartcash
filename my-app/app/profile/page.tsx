"use client"

import axios from "axios";
import { BookOpen, Calculator } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// ---- Tipos ----
export type PurchasedProduct = {
  id: string;
  title: string;
  coverUrl?: string | null;
  purchasedAt: string; // ISO
  downloadUrl: string;
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function AccountPage() {
  const router = useRouter();
  const search = useSearchParams();

  const { data: session, status } = useSession();
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect de cliente deve ser feito via router (não use redirect() em client)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login`);
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        // /api/profile deve retornar user + userData + productsOwned; transformamos em array de produtos
        const res = await axios.get(`/api/profile`);
        const raw = res.data;

        // console.log(res.data)

        // Suporta dois formatos: já array de produtos OU objeto aninhado com userData.productsOwned
        const mapped: PurchasedProduct[] = (raw.map((po: any) => ({
              id: po.product.id,
              title: po.product.title,
              coverUrl: po.product.coverUrl ?? null,
              purchasedAt: (po.product.createdAt ?? new Date()).toString(),
              downloadUrl: po.product.fileUrl ?? "#",
            })));

          console.log(mapped)

        setProducts(mapped);
      } catch (err) {
        console.error("Erro ao coletar dados do usuário", err);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") fetchData();
  }, [status]);
  

  if (status === "loading" || loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-zinc-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-24 rounded-2xl bg-zinc-100" />
            <div className="h-24 rounded-2xl bg-zinc-100" />
            <div className="h-24 rounded-2xl bg-zinc-100" />
          </div>
        </div>
      </main>
    );
  }

  // Se ainda não autenticado, nada a renderizar (router já cuidou do redirect)
  if (!session) return null;

  const user = session.user as {
    id?: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt?: string;
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-zinc-200">
            {user.image ? (
              <img src={user.image} alt={user.name ?? "Avatar"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-500">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Olá, {user.name}</h1>
            <p className="text-sm text-zinc-500">{user.email}</p>
            {user.createdAt && (
              <p className="text-xs text-zinc-400">Cliente desde {formatDate(user.createdAt)}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/auth/signout" className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm text-white transition hover:opacity-90">
            Sair
          </a>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Produtos</p>
          <p className="mt-1 text-2xl font-semibold">{products.length}</p>
          <p className="text-xs text-zinc-400">E-books comprados</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Última compra</p>
          <p className="mt-1 text-2xl font-semibold">{formatDate(products[0]?.purchasedAt)}</p>
          <p className="text-xs text-zinc-400">Data mais recente</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Downloads</p>
          <p className="mt-1 text-2xl font-semibold">Ilimitados</p>
          <p className="text-xs text-zinc-400">Baixe quando quiser</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Seus e‑books</h2>
            <p className="text-sm text-zinc-500">Acesse seus conteúdos comprados</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-10 text-center">
            <p className="text-sm text-zinc-600">Você ainda não comprou nenhum e‑book.</p>
            <a href="/produtos" className="mt-4 rounded-2xl bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-90">Ver catálogo</a>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.id} className="group relative overflow-hidden rounded-2xl border border-zinc-200">
                  <div className={`w-full h-32 sm:h-40 md:h-48 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 text-white`}>
                    <BookOpen className="h-12 w-12 text-white" />
                    <Calculator className="h-12 w-12 text-white" />
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-sm font-medium leading-tight">{p.title}</h3>
                    <span className="whitespace-nowrap rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600">
                      {formatDate(p.purchasedAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                  </div>
                    <a href={p.downloadUrl} download className="flex-1 rounded-xl bg-zinc-900 px-3 py-2 text-center text-xs font-medium text-white transition hover:opacity-90">
                      Baixar
                    </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
