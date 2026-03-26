import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "admin@123",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "portal_de_denuncias",
  port: Number(process.env.PGPORT || 5432),
});

export async function POST(request: NextRequest) {
  try {
    const {
      usuario_codigo,
      categoria,
      data_ocorrencia,
      estado,
      cidade,
      endereco,
      descricao,
    } = await request.json();

    if (
      !usuario_codigo ||
      !categoria ||
      !data_ocorrencia ||
      !estado ||
      !cidade ||
      !endereco ||
      !descricao
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      );
    }

    // Buscar o ID da categoria
    const catResult = await pool.query(
      "SELECT id FROM categorias WHERE nome = $1",
      [categoria],
    );

    if (catResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Categoria inválida" },
        { status: 400 },
      );
    }

    const categoria_id = catResult.rows[0].id;

    const result = await pool.query(
      "INSERT INTO denuncias (usuario_codigo, categoria_id, data_ocorrencia, estado, cidade, endereco, descricao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [
        usuario_codigo,
        categoria_id,
        data_ocorrencia,
        estado,
        cidade,
        endereco,
        descricao,
      ],
    );

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Erro ao submeter denúncia:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
