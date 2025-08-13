<<<<<<< HEAD
import { Category } from '../../../lib/generated/prisma';
import prisma from '@/lib/prisma';
=======
import { prisma } from "@/lib/prisma";
>>>>>>> 9b85b48 (feat: create profile page)

export async function GET(request: Request) {
  try {
    const product = await prisma.product.findMany()
    const category = await prisma.category.findMany()

    console.log(product)
    
    return new Response(JSON.stringify({
      sucess: true,
      products: product,
      categories: category
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json'}
    }
    );

  } catch (error: any) {
    console.error('Erro no processamento dos categorias', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), { status: 500 });
  }
}