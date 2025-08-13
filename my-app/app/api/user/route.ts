import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';


export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!session) {
    return new Response("Não autenticado", { status: 401 });
  }
  
  if (!email) {
    return new Response("Não autenticado", { status: 401 });
  }

  if (!session) {
    return new Response("Não autenticado", { status: 401 });
  }

  try {
    const data = await prisma.user.findUnique({
        where: {
          email
        }
      });

      if(!data) {
        return new Response("Sem dados do usuario", { status: 401 });
      }

    return new Response(JSON.stringify(data))

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