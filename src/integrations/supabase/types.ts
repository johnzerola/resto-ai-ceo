export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          date_unlocked: string | null
          description: string | null
          icon: string | null
          id: string
          is_unlocked: boolean | null
          name: string
          required_goals: number | null
          restaurant_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date_unlocked?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_unlocked?: boolean | null
          name: string
          required_goals?: number | null
          restaurant_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date_unlocked?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_unlocked?: boolean | null
          name?: string
          required_goals?: number | null
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_sistema: {
        Row: {
          created_at: string | null
          dados_contexto: Json | null
          data_criacao: string | null
          data_resolucao: string | null
          id: string
          mensagem: string
          prioridade: string
          resolvido: boolean | null
          restaurant_id: string | null
          tipo_alerta: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          dados_contexto?: Json | null
          data_criacao?: string | null
          data_resolucao?: string | null
          id?: string
          mensagem: string
          prioridade: string
          resolvido?: boolean | null
          restaurant_id?: string | null
          tipo_alerta: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          dados_contexto?: Json | null
          data_criacao?: string | null
          data_resolucao?: string | null
          id?: string
          mensagem?: string
          prioridade?: string
          resolvido?: boolean | null
          restaurant_id?: string | null
          tipo_alerta?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_sistema_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          restaurant_id: string | null
          table_name: string
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          restaurant_id?: string | null
          table_name: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          restaurant_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          average_monthly_revenue: number | null
          average_ticket: number | null
          break_even_point: number | null
          cnpj: string | null
          created_at: string | null
          daily_operating_hours: string | null
          desired_profit_margin: number | null
          fixed_monthly_costs: number | null
          id: string
          ideal_cmv_percentage: number | null
          ideal_net_margin: number | null
          monthly_sales_target: number | null
          motivational_insights: Json | null
          owner_name: string | null
          restaurant_id: string
          updated_at: string | null
          variable_monthly_costs: number | null
          weekly_operating_days: number | null
        }
        Insert: {
          average_monthly_revenue?: number | null
          average_ticket?: number | null
          break_even_point?: number | null
          cnpj?: string | null
          created_at?: string | null
          daily_operating_hours?: string | null
          desired_profit_margin?: number | null
          fixed_monthly_costs?: number | null
          id?: string
          ideal_cmv_percentage?: number | null
          ideal_net_margin?: number | null
          monthly_sales_target?: number | null
          motivational_insights?: Json | null
          owner_name?: string | null
          restaurant_id: string
          updated_at?: string | null
          variable_monthly_costs?: number | null
          weekly_operating_days?: number | null
        }
        Update: {
          average_monthly_revenue?: number | null
          average_ticket?: number | null
          break_even_point?: number | null
          cnpj?: string | null
          created_at?: string | null
          daily_operating_hours?: string | null
          desired_profit_margin?: number | null
          fixed_monthly_costs?: number | null
          id?: string
          ideal_cmv_percentage?: number | null
          ideal_net_margin?: number | null
          monthly_sales_target?: number | null
          motivational_insights?: Json | null
          owner_name?: string | null
          restaurant_id?: string
          updated_at?: string | null
          variable_monthly_costs?: number | null
          weekly_operating_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      canais_venda: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          restaurant_id: string | null
          taxa_fixa: number | null
          taxa_percentual: number | null
          tempo_entrega_min: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          restaurant_id?: string | null
          taxa_fixa?: number | null
          taxa_percentual?: number | null
          tempo_entrega_min?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          restaurant_id?: string | null
          taxa_fixa?: number | null
          taxa_percentual?: number | null
          tempo_entrega_min?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "canais_venda_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_flow: {
        Row: {
          amount: number
          categoria_customizada: string | null
          category: string
          centro_custo: string | null
          conta_origem_id: string | null
          conta_tipo: string | null
          created_at: string | null
          date: string
          description: string | null
          documento: string | null
          id: string
          impacta_cmv: boolean | null
          impacta_dre: boolean | null
          payment_method: string | null
          pessoa_responsavel: string | null
          recorrente: boolean | null
          restaurant_id: string | null
          status: string | null
          type: string
          vencimento: string | null
        }
        Insert: {
          amount: number
          categoria_customizada?: string | null
          category: string
          centro_custo?: string | null
          conta_origem_id?: string | null
          conta_tipo?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          documento?: string | null
          id?: string
          impacta_cmv?: boolean | null
          impacta_dre?: boolean | null
          payment_method?: string | null
          pessoa_responsavel?: string | null
          recorrente?: boolean | null
          restaurant_id?: string | null
          status?: string | null
          type: string
          vencimento?: string | null
        }
        Update: {
          amount?: number
          categoria_customizada?: string | null
          category?: string
          centro_custo?: string | null
          conta_origem_id?: string | null
          conta_tipo?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          documento?: string | null
          id?: string
          impacta_cmv?: boolean | null
          impacta_dre?: boolean | null
          payment_method?: string | null
          pessoa_responsavel?: string | null
          recorrente?: boolean | null
          restaurant_id?: string | null
          status?: string | null
          type?: string
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_flow_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_despesas: {
        Row: {
          ativa: boolean | null
          cor: string | null
          created_at: string | null
          icone: string | null
          id: string
          impacta_cmv: boolean | null
          impacta_dre: boolean | null
          nome: string
          restaurant_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          impacta_cmv?: boolean | null
          impacta_dre?: boolean | null
          nome: string
          restaurant_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          impacta_cmv?: boolean | null
          impacta_dre?: boolean | null
          nome?: string
          restaurant_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_despesas_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_financeiras: {
        Row: {
          ativa: boolean
          cor: string | null
          created_at: string | null
          icone: string | null
          id: string
          impacta_cmv: boolean
          impacta_dre: boolean
          nome: string
          restaurant_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          impacta_cmv?: boolean
          impacta_dre?: boolean
          nome: string
          restaurant_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean
          cor?: string | null
          created_at?: string | null
          icone?: string | null
          id?: string
          impacta_cmv?: boolean
          impacta_dre?: boolean
          nome?: string
          restaurant_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_financeiras_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_precificacao: {
        Row: {
          created_at: string | null
          despesa_fixa_mensal: number | null
          despesa_variavel_percentual: number | null
          id: string
          imposto_percentual: number | null
          margem_seguranca_padrao: number | null
          markup_padrao: number | null
          restaurant_id: string | null
          total_pratos_vendidos_mensal: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          despesa_fixa_mensal?: number | null
          despesa_variavel_percentual?: number | null
          id?: string
          imposto_percentual?: number | null
          margem_seguranca_padrao?: number | null
          markup_padrao?: number | null
          restaurant_id?: string | null
          total_pratos_vendidos_mensal?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          despesa_fixa_mensal?: number | null
          despesa_variavel_percentual?: number | null
          id?: string
          imposto_percentual?: number | null
          margem_seguranca_padrao?: number | null
          markup_padrao?: number | null
          restaurant_id?: string | null
          total_pratos_vendidos_mensal?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_precificacao_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_restaurante: {
        Row: {
          created_at: string | null
          custo_medio_por_prato: number | null
          despesas_fixas_mensais: number | null
          despesas_variaveis_mensais: number | null
          id: string
          margem_lucro_esperada: number | null
          markup_padrao: number | null
          meta_vendas_diaria: number | null
          perda_media_percentual: number | null
          pratos_vendidos_dia_meta: number | null
          receita_mensal_esperada: number | null
          rendimento_porcao_padrao: number | null
          restaurant_id: string | null
          taxa_entrega: number | null
          taxa_ifood: number | null
          taxa_impostos: number | null
          ticket_medio_esperado: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custo_medio_por_prato?: number | null
          despesas_fixas_mensais?: number | null
          despesas_variaveis_mensais?: number | null
          id?: string
          margem_lucro_esperada?: number | null
          markup_padrao?: number | null
          meta_vendas_diaria?: number | null
          perda_media_percentual?: number | null
          pratos_vendidos_dia_meta?: number | null
          receita_mensal_esperada?: number | null
          rendimento_porcao_padrao?: number | null
          restaurant_id?: string | null
          taxa_entrega?: number | null
          taxa_ifood?: number | null
          taxa_impostos?: number | null
          ticket_medio_esperado?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custo_medio_por_prato?: number | null
          despesas_fixas_mensais?: number | null
          despesas_variaveis_mensais?: number | null
          id?: string
          margem_lucro_esperada?: number | null
          markup_padrao?: number | null
          meta_vendas_diaria?: number | null
          perda_media_percentual?: number | null
          pratos_vendidos_dia_meta?: number | null
          receita_mensal_esperada?: number | null
          rendimento_porcao_padrao?: number | null
          restaurant_id?: string | null
          taxa_entrega?: number | null
          taxa_ifood?: number | null
          taxa_impostos?: number | null
          ticket_medio_esperado?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_restaurante_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_a_pagar: {
        Row: {
          categoria: string
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento: string | null
          fornecedor: string | null
          id: string
          notificacao_enviada_1_dia: boolean | null
          notificacao_enviada_vencimento: boolean | null
          observacoes: string | null
          restaurant_id: string | null
          status: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          forma_pagamento?: string | null
          fornecedor?: string | null
          id?: string
          notificacao_enviada_1_dia?: boolean | null
          notificacao_enviada_vencimento?: boolean | null
          observacoes?: string | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          forma_pagamento?: string | null
          fornecedor?: string | null
          id?: string
          notificacao_enviada_1_dia?: boolean | null
          notificacao_enviada_vencimento?: boolean | null
          observacoes?: string | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_a_pagar_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_a_receber: {
        Row: {
          categoria: string
          cliente: string | null
          created_at: string | null
          data_recebimento: string | null
          data_vencimento: string
          descricao: string
          forma_recebimento: string | null
          id: string
          notificacao_enviada_1_dia: boolean | null
          notificacao_enviada_vencimento: boolean | null
          observacoes: string | null
          restaurant_id: string | null
          status: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria?: string
          cliente?: string | null
          created_at?: string | null
          data_recebimento?: string | null
          data_vencimento: string
          descricao: string
          forma_recebimento?: string | null
          id?: string
          notificacao_enviada_1_dia?: boolean | null
          notificacao_enviada_vencimento?: boolean | null
          observacoes?: string | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          cliente?: string | null
          created_at?: string | null
          data_recebimento?: string | null
          data_vencimento?: string
          descricao?: string
          forma_recebimento?: string | null
          id?: string
          notificacao_enviada_1_dia?: boolean | null
          notificacao_enviada_vencimento?: boolean | null
          observacoes?: string | null
          restaurant_id?: string | null
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_a_receber_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      dre_mensal: {
        Row: {
          ano: number
          cmv_alimentos: number | null
          cmv_bebidas: number | null
          cmv_total: number | null
          created_at: string | null
          deducoes_vendas: number | null
          despesas_administrativas: number | null
          despesas_aluguel: number | null
          despesas_delivery: number | null
          despesas_marketing: number | null
          despesas_outras: number | null
          despesas_pessoal: number | null
          ebitda: number | null
          id: string
          lucro_bruto: number | null
          margem_bruta_percentual: number | null
          margem_liquida_percentual: number | null
          mes: number
          receita_bruta: number | null
          receita_liquida: number | null
          restaurant_id: string | null
          resultado_liquido: number | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          cmv_alimentos?: number | null
          cmv_bebidas?: number | null
          cmv_total?: number | null
          created_at?: string | null
          deducoes_vendas?: number | null
          despesas_administrativas?: number | null
          despesas_aluguel?: number | null
          despesas_delivery?: number | null
          despesas_marketing?: number | null
          despesas_outras?: number | null
          despesas_pessoal?: number | null
          ebitda?: number | null
          id?: string
          lucro_bruto?: number | null
          margem_bruta_percentual?: number | null
          margem_liquida_percentual?: number | null
          mes: number
          receita_bruta?: number | null
          receita_liquida?: number | null
          restaurant_id?: string | null
          resultado_liquido?: number | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          cmv_alimentos?: number | null
          cmv_bebidas?: number | null
          cmv_total?: number | null
          created_at?: string | null
          deducoes_vendas?: number | null
          despesas_administrativas?: number | null
          despesas_aluguel?: number | null
          despesas_delivery?: number | null
          despesas_marketing?: number | null
          despesas_outras?: number | null
          despesas_pessoal?: number | null
          ebitda?: number | null
          id?: string
          lucro_bruto?: number | null
          margem_bruta_percentual?: number | null
          margem_liquida_percentual?: number | null
          mes?: number
          receita_bruta?: number | null
          receita_liquida?: number | null
          restaurant_id?: string | null
          resultado_liquido?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dre_mensal_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      embalagens: {
        Row: {
          created_at: string | null
          custo_unitario: number
          fornecedor: string | null
          id: string
          nome: string
          quantidade_minima: number | null
          restaurant_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custo_unitario?: number
          fornecedor?: string | null
          id?: string
          nome: string
          quantidade_minima?: number | null
          restaurant_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custo_unitario?: number
          fornecedor?: string | null
          id?: string
          nome?: string
          quantidade_minima?: number | null
          restaurant_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embalagens_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string | null
          completed: boolean | null
          created_at: string | null
          current: number | null
          deadline: string | null
          description: string | null
          id: string
          linked_to: Json | null
          restaurant_id: string | null
          reward: string | null
          target: number
          title: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          completed?: boolean | null
          created_at?: string | null
          current?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          linked_to?: Json | null
          restaurant_id?: string | null
          reward?: string | null
          target: number
          title: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          completed?: boolean | null
          created_at?: string | null
          current?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          linked_to?: Json | null
          restaurant_id?: string | null
          reward?: string | null
          target?: number
          title?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_fichas: {
        Row: {
          created_at: string | null
          dados_json: Json | null
          data_geracao: string | null
          id: string
          pdf_url: string | null
          prato_id: string | null
          versao: number | null
        }
        Insert: {
          created_at?: string | null
          dados_json?: Json | null
          data_geracao?: string | null
          id?: string
          pdf_url?: string | null
          prato_id?: string | null
          versao?: number | null
        }
        Update: {
          created_at?: string | null
          dados_json?: Json | null
          data_geracao?: string | null
          id?: string
          pdf_url?: string | null
          prato_id?: string | null
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_fichas_prato_id_fkey"
            columns: ["prato_id"]
            isOneToOne: false
            referencedRelation: "pratos"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_rupturas: {
        Row: {
          created_at: string | null
          data_ruptura: string
          dias_sem_estoque: number | null
          id: string
          impacto_vendas: number | null
          insumo_id: string | null
          motivo: string | null
          restaurant_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_ruptura: string
          dias_sem_estoque?: number | null
          id?: string
          impacto_vendas?: number | null
          insumo_id?: string | null
          motivo?: string | null
          restaurant_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_ruptura?: string
          dias_sem_estoque?: number | null
          id?: string
          impacto_vendas?: number | null
          insumo_id?: string | null
          motivo?: string | null
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_rupturas_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_rupturas_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_usage: {
        Row: {
          created_at: string | null
          date: string
          feature_used: string | null
          id: string
          messages_sent: number | null
          plan_limit: number | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          feature_used?: string | null
          id?: string
          messages_sent?: number | null
          plan_limit?: number | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          feature_used?: string | null
          id?: string
          messages_sent?: number | null
          plan_limit?: number | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ingredientes_por_prato: {
        Row: {
          created_at: string | null
          custo_total: number | null
          fator_correcao: number | null
          id: string
          insumo_id: string | null
          prato_id: string | null
          quantidade_bruta: number
          quantidade_liquida: number | null
        }
        Insert: {
          created_at?: string | null
          custo_total?: number | null
          fator_correcao?: number | null
          id?: string
          insumo_id?: string | null
          prato_id?: string | null
          quantidade_bruta: number
          quantidade_liquida?: number | null
        }
        Update: {
          created_at?: string | null
          custo_total?: number | null
          fator_correcao?: number | null
          id?: string
          insumo_id?: string | null
          prato_id?: string | null
          quantidade_bruta?: number
          quantidade_liquida?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredientes_por_prato_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredientes_por_prato_prato_id_fkey"
            columns: ["prato_id"]
            isOneToOne: false
            referencedRelation: "pratos"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos: {
        Row: {
          categoria: string | null
          ciclo_compra_dias: number | null
          codigo: number | null
          consumo_medio_diario: number | null
          conversoes_unidade: Json | null
          created_at: string | null
          estoque_atual: number | null
          estoque_minimo: number | null
          fornecedor: string | null
          id: string
          nome: string
          perda_media_percentual: number | null
          preco_pago: number
          preco_ultima_compra: number | null
          preco_unitario: number | null
          restaurant_id: string | null
          tempo_entrega_dias: number | null
          ultima_compra: string | null
          unidade_medida: string
          updated_at: string | null
          validade_dias: number | null
          volume_embalagem: number
        }
        Insert: {
          categoria?: string | null
          ciclo_compra_dias?: number | null
          codigo?: number | null
          consumo_medio_diario?: number | null
          conversoes_unidade?: Json | null
          created_at?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          nome: string
          perda_media_percentual?: number | null
          preco_pago: number
          preco_ultima_compra?: number | null
          preco_unitario?: number | null
          restaurant_id?: string | null
          tempo_entrega_dias?: number | null
          ultima_compra?: string | null
          unidade_medida: string
          updated_at?: string | null
          validade_dias?: number | null
          volume_embalagem: number
        }
        Update: {
          categoria?: string | null
          ciclo_compra_dias?: number | null
          codigo?: number | null
          consumo_medio_diario?: number | null
          conversoes_unidade?: Json | null
          created_at?: string | null
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          nome?: string
          perda_media_percentual?: number | null
          preco_pago?: number
          preco_ultima_compra?: number | null
          preco_unitario?: number | null
          restaurant_id?: string | null
          tempo_entrega_dias?: number | null
          ultima_compra?: string | null
          unidade_medida?: string
          updated_at?: string | null
          validade_dias?: number | null
          volume_embalagem?: number
        }
        Relationships: [
          {
            foreignKeyName: "insumos_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          id: string
          minimum_stock: number | null
          name: string
          quantity: number | null
          restaurant_id: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          minimum_stock?: number | null
          name: string
          quantity?: number | null
          restaurant_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          minimum_stock?: number | null
          name?: string
          quantity?: number | null
          restaurant_id?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis_diarios: {
        Row: {
          cmv_dia: number | null
          cmv_percentual: number | null
          created_at: string | null
          data: string
          despesas_dia: number | null
          id: string
          lucro_dia: number | null
          margem_dia: number | null
          meta_receita: number | null
          percentual_meta_atingido: number | null
          quantidade_pratos_vendidos: number | null
          receita_delivery: number | null
          receita_total: number | null
          restaurant_id: string | null
          taxa_delivery_paga: number | null
          ticket_medio: number | null
          updated_at: string | null
        }
        Insert: {
          cmv_dia?: number | null
          cmv_percentual?: number | null
          created_at?: string | null
          data: string
          despesas_dia?: number | null
          id?: string
          lucro_dia?: number | null
          margem_dia?: number | null
          meta_receita?: number | null
          percentual_meta_atingido?: number | null
          quantidade_pratos_vendidos?: number | null
          receita_delivery?: number | null
          receita_total?: number | null
          restaurant_id?: string | null
          taxa_delivery_paga?: number | null
          ticket_medio?: number | null
          updated_at?: string | null
        }
        Update: {
          cmv_dia?: number | null
          cmv_percentual?: number | null
          created_at?: string | null
          data?: string
          despesas_dia?: number | null
          id?: string
          lucro_dia?: number | null
          margem_dia?: number | null
          meta_receita?: number | null
          percentual_meta_atingido?: number | null
          quantidade_pratos_vendidos?: number | null
          receita_delivery?: number | null
          receita_total?: number | null
          restaurant_id?: string | null
          taxa_delivery_paga?: number | null
          ticket_medio?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpis_diarios_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_lucro_individual: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          meta_cmv_percentual: number | null
          meta_lucro_percentual: number | null
          meta_lucro_valor: number | null
          meta_vendas_mes: number | null
          prato_id: string | null
          restaurant_id: string
          tipo_meta: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          meta_cmv_percentual?: number | null
          meta_lucro_percentual?: number | null
          meta_lucro_valor?: number | null
          meta_vendas_mes?: number | null
          prato_id?: string | null
          restaurant_id: string
          tipo_meta?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          meta_cmv_percentual?: number | null
          meta_lucro_percentual?: number | null
          meta_lucro_valor?: number | null
          meta_vendas_mes?: number | null
          prato_id?: string | null
          restaurant_id?: string
          tipo_meta?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_lucro_individual_prato_id_fkey"
            columns: ["prato_id"]
            isOneToOne: false
            referencedRelation: "pratos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_vendas: {
        Row: {
          created_at: string | null
          data_meta: string
          id: string
          meta_pratos_dia: number | null
          meta_receita_dia: number | null
          percentual_atingido: number | null
          pratos_vendidos_dia: number | null
          receita_real_dia: number | null
          restaurant_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data_meta: string
          id?: string
          meta_pratos_dia?: number | null
          meta_receita_dia?: number | null
          percentual_atingido?: number | null
          pratos_vendidos_dia?: number | null
          receita_real_dia?: number | null
          restaurant_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data_meta?: string
          id?: string
          meta_pratos_dia?: number | null
          meta_receita_dia?: number | null
          percentual_atingido?: number | null
          pratos_vendidos_dia?: number | null
          receita_real_dia?: number | null
          restaurant_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_vendas_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacao_estoque: {
        Row: {
          created_at: string | null
          data_movimento: string | null
          documento: string | null
          id: string
          insumo_id: string | null
          motivo: string | null
          preco_unitario: number | null
          quantidade: number
          restaurant_id: string | null
          tipo_movimento: string
          usuario_responsavel: string | null
          valor_total: number | null
        }
        Insert: {
          created_at?: string | null
          data_movimento?: string | null
          documento?: string | null
          id?: string
          insumo_id?: string | null
          motivo?: string | null
          preco_unitario?: number | null
          quantidade: number
          restaurant_id?: string | null
          tipo_movimento: string
          usuario_responsavel?: string | null
          valor_total?: number | null
        }
        Update: {
          created_at?: string | null
          data_movimento?: string | null
          documento?: string | null
          id?: string
          insumo_id?: string | null
          motivo?: string | null
          preco_unitario?: number | null
          quantidade?: number
          restaurant_id?: string | null
          tipo_movimento?: string
          usuario_responsavel?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacao_estoque_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacao_estoque_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string
          due_date: string
          id: string
          metadata: Json | null
          payment_date: string | null
          payment_method: string
          restaurant_id: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          metadata?: Json | null
          payment_date?: string | null
          payment_method: string
          restaurant_id?: string | null
          status: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          metadata?: Json | null
          payment_date?: string | null
          payment_method?: string
          restaurant_id?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          access_level: number | null
          created_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          plan_id: string
          price: number | null
          updated_at: string | null
        }
        Insert: {
          access_level?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          plan_id: string
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          access_level?: number | null
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          plan_id?: string
          price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pratos: {
        Row: {
          ativo: boolean | null
          canal_venda: string | null
          categoria: string | null
          created_at: string | null
          custo_embalagem: number | null
          custo_perdas: number | null
          custo_por_porcao: number | null
          custo_total: number | null
          despesas_fixas_mensais: number | null
          despesas_variaveis_mensais: number | null
          embalagem_id: string | null
          formato_venda: string | null
          id: string
          lucro_estimado: number | null
          margem_percentual: number | null
          margem_seguranca: number | null
          markup_personalizado: number | null
          meta_lucro_percentual: number | null
          nome_prato: string
          observacoes: string | null
          peso_bruto_kg: number | null
          peso_liquido_kg: number | null
          preco_concorrente: number | null
          preco_ifood: number | null
          preco_praticado: number | null
          preco_promocional: number | null
          preco_sugerido: number | null
          preco_uber_eats: number | null
          promocao_ativa: boolean | null
          rendimento_porcoes: number | null
          restaurant_id: string | null
          status_viabilidade: string | null
          taxa_entrega: number | null
          taxa_ifood_percentual: number | null
          tempo_preparo_min: number | null
          ultima_venda: string | null
          updated_at: string | null
          vendas_dia: number | null
        }
        Insert: {
          ativo?: boolean | null
          canal_venda?: string | null
          categoria?: string | null
          created_at?: string | null
          custo_embalagem?: number | null
          custo_perdas?: number | null
          custo_por_porcao?: number | null
          custo_total?: number | null
          despesas_fixas_mensais?: number | null
          despesas_variaveis_mensais?: number | null
          embalagem_id?: string | null
          formato_venda?: string | null
          id?: string
          lucro_estimado?: number | null
          margem_percentual?: number | null
          margem_seguranca?: number | null
          markup_personalizado?: number | null
          meta_lucro_percentual?: number | null
          nome_prato: string
          observacoes?: string | null
          peso_bruto_kg?: number | null
          peso_liquido_kg?: number | null
          preco_concorrente?: number | null
          preco_ifood?: number | null
          preco_praticado?: number | null
          preco_promocional?: number | null
          preco_sugerido?: number | null
          preco_uber_eats?: number | null
          promocao_ativa?: boolean | null
          rendimento_porcoes?: number | null
          restaurant_id?: string | null
          status_viabilidade?: string | null
          taxa_entrega?: number | null
          taxa_ifood_percentual?: number | null
          tempo_preparo_min?: number | null
          ultima_venda?: string | null
          updated_at?: string | null
          vendas_dia?: number | null
        }
        Update: {
          ativo?: boolean | null
          canal_venda?: string | null
          categoria?: string | null
          created_at?: string | null
          custo_embalagem?: number | null
          custo_perdas?: number | null
          custo_por_porcao?: number | null
          custo_total?: number | null
          despesas_fixas_mensais?: number | null
          despesas_variaveis_mensais?: number | null
          embalagem_id?: string | null
          formato_venda?: string | null
          id?: string
          lucro_estimado?: number | null
          margem_percentual?: number | null
          margem_seguranca?: number | null
          markup_personalizado?: number | null
          meta_lucro_percentual?: number | null
          nome_prato?: string
          observacoes?: string | null
          peso_bruto_kg?: number | null
          peso_liquido_kg?: number | null
          preco_concorrente?: number | null
          preco_ifood?: number | null
          preco_praticado?: number | null
          preco_promocional?: number | null
          preco_sugerido?: number | null
          preco_uber_eats?: number | null
          promocao_ativa?: boolean | null
          rendimento_porcoes?: number | null
          restaurant_id?: string | null
          status_viabilidade?: string | null
          taxa_entrega?: number | null
          taxa_ifood_percentual?: number | null
          tempo_preparo_min?: number | null
          ultima_venda?: string | null
          updated_at?: string | null
          vendas_dia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pratos_embalagem_id_fkey"
            columns: ["embalagem_id"]
            isOneToOne: false
            referencedRelation: "embalagens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pratos_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      precos_desejados_por_produto: {
        Row: {
          created_at: string | null
          id: string
          lucro_desejado: number | null
          margem_desejada: number | null
          prato_id: string | null
          preco_desejado: number
          restaurant_id: string
          tipo_meta: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lucro_desejado?: number | null
          margem_desejada?: number | null
          prato_id?: string | null
          preco_desejado?: number
          restaurant_id: string
          tipo_meta?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lucro_desejado?: number | null
          margem_desejada?: number | null
          prato_id?: string | null
          preco_desejado?: number
          restaurant_id?: string
          tipo_meta?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precos_desejados_por_produto_prato_id_fkey"
            columns: ["prato_id"]
            isOneToOne: false
            referencedRelation: "pratos"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_models: {
        Row: {
          channel: string
          created_at: string | null
          delivery_fee: number | null
          id: string
          is_active: boolean | null
          markup_percentage: number
          platform_commission: number | null
          restaurant_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          delivery_fee?: number | null
          id?: string
          is_active?: boolean | null
          markup_percentage?: number
          platform_commission?: number | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          delivery_fee?: number | null
          id?: string
          is_active?: boolean | null
          markup_percentage?: number
          platform_commission?: number | null
          restaurant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_models_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_login: string | null
          name: string | null
          preferences: Json | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          last_login?: string | null
          name?: string | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_login?: string | null
          name?: string | null
          preferences?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projecoes_financeiras: {
        Row: {
          cenario_selecionado: string | null
          created_at: string | null
          dados_mensais: Json | null
          despesas_mensais_atuais: number
          id: string
          lucro_projetado_final: number | null
          margem_final_percentual: number | null
          nome_projecao: string
          observacoes: string | null
          periodo_meses: number
          receita_mensal_atual: number
          receita_projetada_final: number | null
          restaurant_id: string | null
          taxa_crescimento_anual: number
          updated_at: string | null
        }
        Insert: {
          cenario_selecionado?: string | null
          created_at?: string | null
          dados_mensais?: Json | null
          despesas_mensais_atuais?: number
          id?: string
          lucro_projetado_final?: number | null
          margem_final_percentual?: number | null
          nome_projecao: string
          observacoes?: string | null
          periodo_meses?: number
          receita_mensal_atual?: number
          receita_projetada_final?: number | null
          restaurant_id?: string | null
          taxa_crescimento_anual?: number
          updated_at?: string | null
        }
        Update: {
          cenario_selecionado?: string | null
          created_at?: string | null
          dados_mensais?: Json | null
          despesas_mensais_atuais?: number
          id?: string
          lucro_projetado_final?: number | null
          margem_final_percentual?: number | null
          nome_projecao?: string
          observacoes?: string | null
          periodo_meses?: number
          receita_mensal_atual?: number
          receita_projetada_final?: number | null
          restaurant_id?: string | null
          taxa_crescimento_anual?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projecoes_financeiras_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          id: string
          name: string
          quantity: number
          recipe_id: string | null
          total_cost: number | null
          unit: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          name: string
          quantity: number
          recipe_id?: string | null
          total_cost?: number | null
          unit: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          name?: string
          quantity?: number
          recipe_id?: string | null
          total_cost?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          portion_size: number | null
          portion_unit: string | null
          restaurant_id: string | null
          selling_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          portion_size?: number | null
          portion_unit?: string | null
          restaurant_id?: string | null
          selling_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          portion_size?: number | null
          portion_unit?: string | null
          restaurant_id?: string | null
          selling_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_members: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_members_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          average_monthly_sales: number | null
          business_type: string | null
          cnpj: string | null
          created_at: string | null
          desired_profit_margin: number | null
          fixed_expenses: number | null
          id: string
          name: string
          owner_id: string
          owner_name: string | null
          target_beverage_cost: number | null
          target_food_cost: number | null
          updated_at: string | null
          variable_expenses: number | null
        }
        Insert: {
          average_monthly_sales?: number | null
          business_type?: string | null
          cnpj?: string | null
          created_at?: string | null
          desired_profit_margin?: number | null
          fixed_expenses?: number | null
          id?: string
          name: string
          owner_id: string
          owner_name?: string | null
          target_beverage_cost?: number | null
          target_food_cost?: number | null
          updated_at?: string | null
          variable_expenses?: number | null
        }
        Update: {
          average_monthly_sales?: number | null
          business_type?: string | null
          cnpj?: string | null
          created_at?: string | null
          desired_profit_margin?: number | null
          fixed_expenses?: number | null
          id?: string
          name?: string
          owner_id?: string
          owner_name?: string | null
          target_beverage_cost?: number | null
          target_food_cost?: number | null
          updated_at?: string | null
          variable_expenses?: number | null
        }
        Relationships: []
      }
      resultados_estimados_por_receita: {
        Row: {
          alertas: Json | null
          cmv_estimado_percentual: number | null
          cmv_estimado_valor: number | null
          created_at: string | null
          id: string
          lucro_estimado_percentual: number | null
          lucro_estimado_valor: number | null
          margem_bruta: number | null
          margem_liquida: number | null
          prato_id: string | null
          preco_sugerido: number | null
          rentabilidade_mensal: number | null
          rentabilidade_unitaria: number | null
          restaurant_id: string
          status_analise: string | null
          updated_at: string | null
        }
        Insert: {
          alertas?: Json | null
          cmv_estimado_percentual?: number | null
          cmv_estimado_valor?: number | null
          created_at?: string | null
          id?: string
          lucro_estimado_percentual?: number | null
          lucro_estimado_valor?: number | null
          margem_bruta?: number | null
          margem_liquida?: number | null
          prato_id?: string | null
          preco_sugerido?: number | null
          rentabilidade_mensal?: number | null
          rentabilidade_unitaria?: number | null
          restaurant_id: string
          status_analise?: string | null
          updated_at?: string | null
        }
        Update: {
          alertas?: Json | null
          cmv_estimado_percentual?: number | null
          cmv_estimado_valor?: number | null
          created_at?: string | null
          id?: string
          lucro_estimado_percentual?: number | null
          lucro_estimado_valor?: number | null
          margem_bruta?: number | null
          margem_liquida?: number | null
          prato_id?: string | null
          preco_sugerido?: number | null
          rentabilidade_mensal?: number | null
          rentabilidade_unitaria?: number | null
          restaurant_id?: string
          status_analise?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resultados_estimados_por_receita_prato_id_fkey"
            columns: ["prato_id"]
            isOneToOne: false
            referencedRelation: "pratos"
            referencedColumns: ["id"]
          },
        ]
      }
      simulacoes_precos: {
        Row: {
          created_at: string
          custo_direto: number
          custo_mao_obra: number
          custos_fixos: number
          id: string
          impostos_percentual: number
          lucro_bruto: number
          margem_desejada: number
          markup_calculado: number
          nome_produto: string
          observacoes: string | null
          preco_sugerido: number
          precos_concorrentes: Json | null
          restaurant_id: string
          status_viabilidade: string
          taxa_entrega: number
          taxa_plataforma: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custo_direto?: number
          custo_mao_obra?: number
          custos_fixos?: number
          id?: string
          impostos_percentual?: number
          lucro_bruto?: number
          margem_desejada?: number
          markup_calculado?: number
          nome_produto: string
          observacoes?: string | null
          preco_sugerido?: number
          precos_concorrentes?: Json | null
          restaurant_id: string
          status_viabilidade?: string
          taxa_entrega?: number
          taxa_plataforma?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custo_direto?: number
          custo_mao_obra?: number
          custos_fixos?: number
          id?: string
          impostos_percentual?: number
          lucro_bruto?: number
          margem_desejada?: number
          markup_calculado?: number
          nome_produto?: string
          observacoes?: string | null
          preco_sugerido?: number
          precos_concorrentes?: Json | null
          restaurant_id?: string
          status_viabilidade?: string
          taxa_entrega?: number
          taxa_plataforma?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          features: Json | null
          id: string
          last_login: string | null
          limits: Json | null
          name: string | null
          plan_status: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          trial_start: string | null
          trial_used: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          features?: Json | null
          id?: string
          last_login?: string | null
          limits?: Json | null
          name?: string | null
          plan_status?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          trial_start?: string | null
          trial_used?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          features?: Json | null
          id?: string
          last_login?: string | null
          limits?: Json | null
          name?: string | null
          plan_status?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          trial_start?: string | null
          trial_used?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          id: string
          message: string
          metadata: Json | null
          severity: string
          source: string
          timestamp: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          id?: string
          message: string
          metadata?: Json | null
          severity?: string
          source?: string
          timestamp?: string | null
          type?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string
          source?: string
          timestamp?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tabela_contexto: {
        Row: {
          contexto: string
          created_at: string
          id: number
          palavra_chave: string
          updated_at: string
        }
        Insert: {
          contexto: string
          created_at?: string
          id?: number
          palavra_chave: string
          updated_at?: string
        }
        Update: {
          contexto?: string
          created_at?: string
          id?: number
          palavra_chave?: string
          updated_at?: string
        }
        Relationships: []
      }
      taxas_delivery: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          id: string
          plataforma: string
          restaurant_id: string | null
          tipo_taxa: string
          updated_at: string | null
          valor_taxa: number
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          plataforma: string
          restaurant_id?: string | null
          tipo_taxa: string
          updated_at?: string | null
          valor_taxa?: number
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          id?: string
          plataforma?: string
          restaurant_id?: string | null
          tipo_taxa?: string
          updated_at?: string | null
          valor_taxa?: number
        }
        Relationships: [
          {
            foreignKeyName: "taxas_delivery_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tendencias_estoque: {
        Row: {
          created_at: string | null
          data_analise: string
          dias_para_ruptura: number | null
          entradas_periodo: number | null
          estoque_final: number | null
          estoque_inicial: number | null
          id: string
          insumo_id: string | null
          restaurant_id: string | null
          saidas_periodo: number | null
          taxa_consumo_diaria: number | null
          tendencia: string | null
        }
        Insert: {
          created_at?: string | null
          data_analise?: string
          dias_para_ruptura?: number | null
          entradas_periodo?: number | null
          estoque_final?: number | null
          estoque_inicial?: number | null
          id?: string
          insumo_id?: string | null
          restaurant_id?: string | null
          saidas_periodo?: number | null
          taxa_consumo_diaria?: number | null
          tendencia?: string | null
        }
        Update: {
          created_at?: string | null
          data_analise?: string
          dias_para_ruptura?: number | null
          entradas_periodo?: number | null
          estoque_final?: number | null
          estoque_inicial?: number | null
          id?: string
          insumo_id?: string | null
          restaurant_id?: string | null
          saidas_periodo?: number | null
          taxa_consumo_diaria?: number | null
          tendencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tendencias_estoque_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tendencias_estoque_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_medida: {
        Row: {
          created_at: string | null
          fator_conversao: number | null
          id: string
          nome: string
          tipo: string
          unidade_base: string | null
        }
        Insert: {
          created_at?: string | null
          fator_conversao?: number | null
          id?: string
          nome: string
          tipo: string
          unidade_base?: string | null
        }
        Update: {
          created_at?: string | null
          fator_conversao?: number | null
          id?: string
          nome?: string
          tipo?: string
          unidade_base?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          event: string
          id: string
          payload: Json | null
          processed_at: string | null
          response: Json | null
          status: string
          timestamp: string | null
          user_id: string | null
          webhook_url: string | null
        }
        Insert: {
          event: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          response?: Json | null
          status?: string
          timestamp?: string | null
          user_id?: string | null
          webhook_url?: string | null
        }
        Update: {
          event?: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          response?: Json | null
          status?: string
          timestamp?: string | null
          user_id?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_expire_trials: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calcular_cmv_completo: {
        Args: { prato_uuid: string }
        Returns: {
          custo_ingredientes: number
          custo_embalagem: number
          custo_perdas: number
          custo_total: number
          custo_por_porcao: number
          margem_bruta_percentual: number
          margem_liquida_percentual: number
          preco_sugerido_balcao: number
          preco_sugerido_ifood: number
          status_viabilidade: string
        }[]
      }
      calcular_cmv_completo_melhorado: {
        Args: { prato_uuid: string }
        Returns: {
          custo_ingredientes: number
          despesas_fixas_prato: number
          despesas_variaveis_prato: number
          custo_total_final: number
          custo_por_porcao: number
          preco_sugerido_calculado: number
          margem_bruta_percentual: number
          margem_liquida_percentual: number
          status_viabilidade: string
          alertas: Json
        }[]
      }
      calcular_cmv_inteligente: {
        Args: { prato_uuid: string; preco_final?: number }
        Returns: {
          cmv_estimado_percentual: number
          cmv_estimado_valor: number
          lucro_estimado_valor: number
          lucro_estimado_percentual: number
          margem_bruta: number
          margem_liquida: number
          preco_sugerido: number
          status_viabilidade: string
          alertas: Json
        }[]
      }
      calcular_custos_prato: {
        Args: { prato_uuid: string }
        Returns: {
          custo_total: number
          custo_por_porcao: number
          preco_sugerido: number
          lucro_estimado: number
          margem_percentual: number
          status_viabilidade: string
        }[]
      }
      calcular_dre_mensal: {
        Args: { restaurant_uuid: string; mes_param: number; ano_param: number }
        Returns: undefined
      }
      calcular_estoque_minimo_automatico: {
        Args: { insumo_uuid: string }
        Returns: number
      }
      calcular_meta_diaria: {
        Args: { restaurant_uuid: string }
        Returns: {
          meta_receita: number
          meta_pratos: number
          ticket_medio: number
        }[]
      }
      calcular_metricas_financeiras: {
        Args: { restaurant_uuid: string }
        Returns: {
          cmv_valor: number
          cmv_percentual: number
          receita_total: number
          despesas_operacionais: number
          lucro_bruto: number
          margem_bruta_percentual: number
        }[]
      }
      check_trial_status: {
        Args: { user_email: string }
        Returns: {
          is_trial_active: boolean
          days_remaining: number
          trial_end_date: string
          plan_status: string
        }[]
      }
      detectar_tendencias_estoque: {
        Args: { restaurant_uuid: string }
        Returns: undefined
      }
      gerar_alertas_automaticos: {
        Args: { restaurant_uuid: string }
        Returns: undefined
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      log_security_event: {
        Args: { event_type: string; user_id?: string; details?: Json }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      system_healthcheck: {
        Args: { restaurant_uuid: string }
        Returns: Json
      }
      validate_password_strength: {
        Args: { password_text: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
