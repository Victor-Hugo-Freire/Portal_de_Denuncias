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
('XYZ67890'),
('LMN11223'),
('QWE44556'),
('RTY77889'),
('UIO99001'),
('PAS22334');

INSERT INTO categorias (nome, descricao) VALUES
('corrupcao', 'Corrupção'),
('abuso_poder', 'Abuso de poder'),
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
 ('ABC12345', 1, '2023-10-01', 'São Paulo', 'São Paulo', 'Rua das Flores, 123 - Centro Histórico - São Paulo - SP', 'Foi identificado um possível esquema de corrupção envolvendo servidores públicos responsáveis por contratos administrativos, onde há indícios de favorecimento indevido, recebimento de vantagens ilícitas e manipulação de processos internos para benefício próprio.', 'pendente'),
('XYZ67890', 2, '2023-09-15', 'Rio de Janeiro', 'Rio de Janeiro', 'Avenida Atlântica, 456 - Copacabana - Rio de Janeiro - RJ', 'Relato de abuso de poder por parte de autoridade pública que utilizou sua posição para intimidar cidadãos, impondo decisões arbitrárias e desrespeitando normas legais estabelecidas, causando prejuízos e constrangimento às vítimas envolvidas.', 'em_andamento'),
('LMN11223', 3, '2024-01-10', 'Paraná', 'Curitiba', 'Rua XV de Novembro, 1000 - Centro Comercial - Curitiba - PR', 'Há suspeitas consistentes de fraude em processo licitatório, com possível combinação prévia entre empresas participantes, manipulação de documentos oficiais e direcionamento do resultado final para favorecer determinados grupos econômicos.', 'pendente'),
('QWE44556', 4, '2024-02-05', 'Bahia', 'Salvador', 'Avenida Sete de Setembro, 250 - Centro Histórico - Salvador - BA', 'Foi relatado um caso de discriminação dentro de um órgão público, onde indivíduos foram tratados de maneira desigual com base em características pessoais, resultando em constrangimento, exclusão e prejuízo no acesso a serviços essenciais.', 'em_andamento'),
('RTY77889', 6, '2024-03-12', 'Minas Gerais', 'Belo Horizonte', 'Rua da Bahia, 300 - Região Central - Belo Horizonte - MG', 'Denúncia envolvendo situação de violência praticada por agente público durante abordagem, incluindo uso excessivo de força, ameaças verbais e comportamento inadequado que coloca em risco a integridade física e psicológica dos envolvidos.', 'pendente'),
('UIO99001', 5, '2024-03-20', 'Amazonas', 'Manaus', 'Avenida Eduardo Ribeiro, 700 - Centro - Manaus - AM', 'Foi identificada possível violação ambiental em área protegida, com indícios de desmatamento irregular, descarte inadequado de resíduos e ausência de fiscalização adequada por parte dos órgãos responsáveis pela preservação ambiental.', 'em_andamento'),
('PAS22334', 8, '2024-04-01', 'Rio Grande do Sul', 'Porto Alegre', 'Rua dos Andradas, 450 - Centro Histórico - Porto Alegre - RS', 'Há indícios de prática de nepotismo dentro da administração pública, com nomeações de familiares para cargos estratégicos sem critérios técnicos, comprometendo a transparência, eficiência e legalidade das decisões administrativas.', 'pendente'),
('ABC12345', 9, '2024-04-10', 'São Paulo', 'Campinas', 'Avenida Brasil, 1200 - Bairro Guanabara - Campinas - SP', 'Foram identificados indícios de desvio de dinheiro público em obra municipal, com possíveis superfaturamentos, medições falsas e ausência de execução real de serviços contratados, causando prejuízo significativo aos cofres públicos.', 'em_andamento'),
('XYZ67890', 10, '2024-04-15', 'Ceará', 'Fortaleza', 'Avenida Beira Mar, 900 - Meireles - Fortaleza - CE', 'Relato de utilização de falsa identidade para obtenção de benefícios indevidos junto a programas governamentais, incluindo apresentação de documentos falsificados e tentativa de enganar sistemas de verificação oficial.', 'pendente'),
('LMN11223', 11, '2024-04-20', 'Pernambuco', 'Recife', 'Rua do Bom Jesus, 200 - Recife Antigo - Recife - PE', 'Denúncia aponta tentativa de extorsão envolvendo servidor público que teria exigido vantagens financeiras indevidas para facilitar processos administrativos, utilizando sua posição para pressionar e intimidar cidadãos.', 'em_andamento'),
('QWE44556', 12, '2024-04-25', 'Goiás', 'Goiânia', 'Avenida Goiás, 1500 - Setor Central - Goiânia - GO', 'Foi identificado possível pagamento de suborno com o objetivo de acelerar processos internos em órgão público, indicando quebra de integridade administrativa e favorecimento indevido mediante vantagens ilícitas.', 'pendente'),
('RTY77889', 13, '2024-05-01', 'Santa Catarina', 'Florianópolis', 'Avenida Beira-Mar Norte, 300 - Centro - Florianópolis - SC', 'Há evidências de falsificação de documentos oficiais, incluindo adulteração de registros e emissão de certificados fraudulentos, com potencial impacto jurídico e administrativo significativo para as instituições envolvidas.', 'em_andamento');