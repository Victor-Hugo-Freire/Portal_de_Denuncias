import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT),
});

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID e status são obrigatórios" },
        { status: 400 },
      );
    }

    const validStatuses = ["pendente", "em_andamento", "resolvido"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      "UPDATE denuncias SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Denúncia não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status atualizado com sucesso",
      denuncia: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
