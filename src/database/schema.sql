CREATE TABLE IF NOT EXISTS usuarios (
  codigo CHAR(8) PRIMARY KEY,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS denuncias (
  id SERIAL PRIMARY KEY,
  usuario_codigo CHAR(8) NOT NULL REFERENCES usuarios(codigo),
  categoria VARCHAR(50) NOT NULL,
  data_ocorrencia DATE NOT NULL,
  estado VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO usuarios (codigo) VALUES
('ABC12345'),
('XYZ67890');

INSERT INTO denuncias (usuario_codigo, categoria, data_ocorrencia, estado, cidade, bairro, descricao, status)
VALUES
  ('ABC12345', 'corrupcao', '2023-10-01', 'São Paulo', 'São Paulo', 'Centro', 'Descrição de teste para corrupção.', 'pendente'),
  ('XYZ67890', 'abuso', '2023-09-15', 'Rio de Janeiro', 'Rio de Janeiro', 'Copacabana', 'Descrição de teste para abuso de poder.', 'em_andamento');
