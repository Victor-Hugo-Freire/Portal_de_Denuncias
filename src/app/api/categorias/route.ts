import { NextResponse } from "next/server";
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
