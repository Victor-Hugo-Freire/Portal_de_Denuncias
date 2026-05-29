import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT),
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT nome, descricao FROM categorias ORDER BY id",
    );
    client.release();
    const categorias = result.rows.map((row) => ({
      value: row.nome,
      label: row.descricao,
    }));
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nome } = await request.json();

    if (!nome || nome.length < 6 || nome.length > 30) {
      return NextResponse.json(
        { error: "Categoria deve ter entre 6 e 30 caracteres" },
        { status: 400 },
      );
    }

    const client = await pool.connect();

    // Verificar se categoria já existe
    const existingResult = await client.query(
      "SELECT id FROM categorias WHERE nome = $1",
      [nome.toLowerCase()],
    );

    let categoryId;
    if (existingResult.rows.length > 0) {
      categoryId = existingResult.rows[0].id;
    } else {
      // Criar nova categoria
      const insertResult = await client.query(
        "INSERT INTO categorias (nome, descricao) VALUES ($1, $2) RETURNING id",
        [nome.toLowerCase(), nome],
      );
      categoryId = insertResult.rows[0].id;
    }

    client.release();
    return NextResponse.json({ id: categoryId, nome });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
