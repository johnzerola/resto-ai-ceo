
-- Habilitar extensão pg_trgm primeiro
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Criar tabela para armazenar contextos para IA
CREATE TABLE public.tabela_contexto (
  id SERIAL PRIMARY KEY,
  palavra_chave TEXT NOT NULL,
  contexto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar comentários para documentar a tabela
COMMENT ON TABLE public.tabela_contexto IS 'Tabela para armazenar palavras-chave e contextos que serão utilizados pela IA para enriquecer respostas';
COMMENT ON COLUMN public.tabela_contexto.palavra_chave IS 'Palavras-chave ou termos relacionados às perguntas dos usuários';
COMMENT ON COLUMN public.tabela_contexto.contexto IS 'Conteúdo contextual que será usado para enriquecer as respostas da IA';

-- Criar índice para otimizar as consultas ILIKE na palavra_chave (agora com a extensão habilitada)
CREATE INDEX idx_tabela_contexto_palavra_chave ON public.tabela_contexto USING gin(palavra_chave gin_trgm_ops);

-- Criar trigger para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_tabela_contexto_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tabela_contexto_updated_at
  BEFORE UPDATE ON public.tabela_contexto
  FOR EACH ROW
  EXECUTE FUNCTION update_tabela_contexto_updated_at();

-- Inserir registros de exemplo
INSERT INTO public.tabela_contexto (palavra_chave, contexto) VALUES 
('pagamento', 'Instruções detalhadas sobre o processo de pagamento, prazos e formas aceitas. O sistema aceita cartão de crédito, débito, PIX e transferência bancária. Os pagamentos são processados em até 24 horas úteis.'),
('suporte', 'Informações sobre como o usuário pode acionar o suporte técnico e os horários de atendimento. O suporte está disponível de segunda a sexta das 8h às 18h através do chat online, email ou telefone.'),
('restaurante', 'Sistema completo de gestão para restaurantes incluindo controle de estoque, cálculo de custos, precificação, fluxo de caixa e análises financeiras. Permite gerenciar receitas, ingredientes e cardápios.'),
('ficha técnica', 'Funcionalidade para criar fichas técnicas de pratos, calculando automaticamente custos por porção, preços sugeridos e margens de lucro baseados nos ingredientes utilizados.'),
('estoque', 'Módulo de controle de estoque permite cadastrar produtos, definir quantidades mínimas, registrar entradas e saídas, e receber alertas quando itens estão em falta.'),
('relatórios', 'O sistema gera diversos relatórios incluindo DRE, fluxo de caixa, análise de custos (CMV), performance de vendas e projeções financeiras para auxiliar na tomada de decisões.');

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.tabela_contexto ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública (necessário para n8n)
CREATE POLICY "Permitir leitura pública da tabela_contexto" 
  ON public.tabela_contexto 
  FOR SELECT 
  TO public 
  USING (true);

-- Criar política para permitir inserção e atualização apenas por usuários autenticados
CREATE POLICY "Permitir inserção para usuários autenticados" 
  ON public.tabela_contexto 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados" 
  ON public.tabela_contexto 
  FOR UPDATE 
  TO authenticated 
  USING (true);
