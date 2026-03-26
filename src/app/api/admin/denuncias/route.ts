import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  password: "admin@123",
  host: "localhost",
  port: 5432,
  database: "portal_de_denuncias",
});

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT d.id, c.nome as categoria, d.data_ocorrencia, d.estado, d.cidade, d.endereco, d.descricao, d.status, d.usuario_codigo FROM denuncias d JOIN categorias c ON d.categoria_id = c.id ORDER BY d.data_ocorrencia DESC",
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
