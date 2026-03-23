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
    const { code } = await request.json();

    if (!code || typeof code !== "string" || code.length !== 8) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    }

    await pool.query(
      "INSERT INTO usuarios (codigo) VALUES ($1) ON CONFLICT (codigo) DO NOTHING",
      [code],
    );

    return NextResponse.json({ success: true, message: "Usuário registrado" });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
