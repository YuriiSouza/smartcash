import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

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
  const email = session?.user?.email;

  if (!session) {
    return new Response("Não autenticado", { status: 401 });
  }
  
  if (!email) {
    return new Response("Não autenticado", { status: 401 });
  }


  try {
    const data = await prisma.user.findUnique({
        where: {
          email
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