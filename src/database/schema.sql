CREATE TABLE usuarios (
  codigo CHAR(8) PRIMARY KEY,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT
);

CREATE TABLE denuncias (
  id SERIAL PRIMARY KEY,
  usuario_codigo CHAR(8) NOT NULL REFERENCES usuarios(codigo),
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  data_ocorrencia DATE NOT NULL CHECK (data_ocorrencia >= '1990-01-01'),
  estado VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  endereco VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO usuarios (codigo) VALUES
('ABC12345'),
('XYZ67890');

INSERT INTO categorias (nome, descricao) VALUES
('corrupcao', 'Corrupção'),
('abuso', 'Abuso de poder'),
('fraude', 'Fraude'),
('discriminacao', 'Discriminação'),
('violacao_ambiental', 'Violação ambiental'),
('violencia', 'Violência'),
('peculato', 'Peculato'),
('nepotismo', 'Nepotismo'),
('desvio_dinheiro', 'Desvio de dinheiro público'),
('falsa_identidade', 'Falsidade de identidade'),
('extorsao', 'Extorsão'),
('suborno', 'Suborno'),
('falsificacao', 'Falsificação de documentos'),
('assedio', 'Assédio moral ou sexual'),
('evasao_fiscal', 'Evasão fiscal'),
('outro', 'Outro');

INSERT INTO denuncias (usuario_codigo, categoria_id, data_ocorrencia, estado, cidade, endereco, descricao, status)
VALUES
  ('ABC12345', 1, '2023-10-01', 'São Paulo', 'São Paulo', 'Rua das Flores, 123 - Centro - São Paulo - SP', 'Descrição de teste para corrupção.', 'pendente'),
  ('XYZ67890', 2, '2023-09-15', 'Rio de Janeiro', 'Rio de Janeiro', 'Avenida Atlântica, 456 - Copacabana - Rio de Janeiro - RJ', 'Descrição de teste para abuso de poder.', 'em_andamento');
