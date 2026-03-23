import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "admin@123",
  host: "localhost",
  port: 5432,
  database: "portal_de_denuncias",
});

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Código é obrigatório" },
        { status: 400 },
      );
    }

    const client = await pool.connect();
    const result = await client.query(
      "SELECT id, categoria, data_ocorrencia, estado, cidade, bairro, descricao, status FROM denuncias WHERE usuario_codigo = $1 ORDER BY data_ocorrencia DESC",
      [code],
    );
    client.release();

    return NextResponse.json({ denuncias: result.rows });
  } catch (error) {
    console.error("Erro ao buscar denúncias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
