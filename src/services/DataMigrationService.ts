
import { supabase } from '@/integrations/supabase/client';
import { SystemLogService } from './SystemLogService';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  skippedCount: number;
}

export class DataMigrationService {
  static async migrateSubscribersToNewFormat(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    };

    try {
      await SystemLogService.log(
        'DataMigration',
        'migration_start',
        'Iniciando migração de subscribers para novo formato',
        'info'
      );

      // Buscar todos os subscribers que precisam de migração
      const { data: subscribers, error: fetchError } = await supabase
        .from('subscribers')
        .select('*')
        .or('features.is.null,limits.is.null,plan_status.is.null');

      if (fetchError) {
        result.errors.push(`Erro ao buscar subscribers: ${fetchError.message}`);
        return result;
      }

      if (!subscribers || subscribers.length === 0) {
        result.success = true;
        await SystemLogService.log(
          'DataMigration',
          'migration_complete',
          'Nenhum subscriber necessita migração',
          'info'
        );
        return result;
      }

      console.log(`Encontrados ${subscribers.length} subscribers para migração`);

      // Processar cada subscriber
      for (const subscriber of subscribers) {
        try {
          // Determinar plano baseado no subscription_tier
          const planTier = subscriber.subscription_tier || 'free';
          let features = {};
          let limits = {};

          switch (planTier.toLowerCase()) {
            case 'profissional':
            case 'professional':
            case 'pro':
              features = {
                hasAdvancedReports: true,
                hasFullAIAssistant: true,
                hasInventoryManagement: true,
                hasFinancialAnalysis: true,
                hasTeamManagement: true,
                hasPrioritySupport: true,
                hasSimuladorCenarios: true
              };
              limits = {
                maxRestaurants: 5,
                menuItems: -1,
                cashFlowEntries: -1,
                teamMembers: 10,
                aiMessages: -1
              };
              break;
            case 'essencial':
            case 'essential':
            case 'basic':
              features = {
                hasAdvancedReports: true,
                hasFullAIAssistant: false,
                hasInventoryManagement: true,
                hasFinancialAnalysis: true,
                hasTeamManagement: false,
                hasPrioritySupport: false,
                hasSimuladorCenarios: false
              };
              limits = {
                maxRestaurants: 2,
                menuItems: 500,
                cashFlowEntries: 1000,
                teamMembers: 3,
                aiMessages: 100
              };
              break;
            default: // free
              features = {
                hasAdvancedReports: false,
                hasFullAIAssistant: false,
                hasInventoryManagement: false,
                hasFinancialAnalysis: false,
                hasTeamManagement: false,
                hasPrioritySupport: false,
                hasSimuladorCenarios: false
              };
              limits = {
                maxRestaurants: 1,
                menuItems: 50,
                cashFlowEntries: 100,
                teamMembers: 1,
                aiMessages: 10
              };
              break;
          }

          // Atualizar subscriber com novos campos
          const { error: updateError } = await supabase
            .from('subscribers')
            .update({
              features: features,
              limits: limits,
              plan_status: subscriber.plan_status || 'active',
              subscription_tier: planTier,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscriber.id);

          if (updateError) {
            result.errors.push(`Erro ao atualizar subscriber ${subscriber.id}: ${updateError.message}`);
            continue;
          }

          result.migratedCount++;
          console.log(`Subscriber ${subscriber.id} migrado com sucesso para plano ${planTier}`);

        } catch (error) {
          result.errors.push(`Erro ao processar subscriber ${subscriber.id}: ${error}`);
          result.skippedCount++;
        }
      }

      result.success = result.errors.length === 0;

      await SystemLogService.log(
        'DataMigration',
        'migration_complete',
        `Migração concluída: ${result.migratedCount} migrados, ${result.skippedCount} pulados, ${result.errors.length} erros`,
        result.success ? 'info' : 'warning'
      );

      return result;

    } catch (error) {
      result.errors.push(`Erro geral na migração: ${error}`);
      await SystemLogService.log(
        'DataMigration',
        'migration_error',
        `Erro crítico na migração: ${error}`,
        'error'
      );
      return result;
    }
  }

  static async validateDataIntegrity(): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Verificar se todos os subscribers têm features e limits
      const { data: missingFeatures } = await supabase
        .from('subscribers')
        .select('id, email, subscription_tier')
        .or('features.is.null,limits.is.null');

      if (missingFeatures && missingFeatures.length > 0) {
        issues.push(`${missingFeatures.length} subscribers sem features/limits definidas`);
      }

      // Verificar se todos os planos têm dados válidos
      const { data: plans } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true);

      if (!plans || plans.length === 0) {
        issues.push('Nenhum plano ativo encontrado');
      } else {
        for (const plan of plans) {
          if (!plan.features || !plan.limits) {
            issues.push(`Plano ${plan.plan_id} sem features/limits definidas`);
          }
        }
      }

      // Verificar consistência de dados
      const { data: subscribersWithPlans } = await supabase
        .from('subscribers')
        .select('subscription_tier')
        .not('subscription_tier', 'is', null);

      const validPlanIds = plans?.map(p => p.plan_id) || [];
      const invalidTiers = subscribersWithPlans?.filter(s => 
        s.subscription_tier && !validPlanIds.includes(s.subscription_tier)
      ) || [];

      if (invalidTiers.length > 0) {
        issues.push(`${invalidTiers.length} subscribers com planos inválidos`);
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      issues.push(`Erro ao validar integridade: ${error}`);
      return { isValid: false, issues };
    }
  }
}
