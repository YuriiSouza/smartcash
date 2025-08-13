import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

type PurchasedProduct = {
  id: string;
  title: string;
  coverUrl?: string | null;
  purchasedAt: string; // ISO
  downloadUrl: string;
};

type UserUI = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: string; // ISO
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Não autenticado", { status: 401 });
  }

  try {
    const data = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
        include: {
              productsOwned: {
                include: {
                  product: true,
                },
          },
        },
      });

      if(!data) {
        return new Response("Sem dados do usuario", { status: 401 });
      }

    return new Response(JSON.stringify(data?.productsOwned))
  } catch (error: any) {
    console.error('Erro ao processar pagamento transparente:', error);
    return new Response(JSON.stringify({
      error: 'Falha ao processar dados do usuario.',
      details: 'errorMessage'
    }), {
      status: error.status || 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}