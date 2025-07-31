import React from "react";
import { ModernLayout } from "@/components/restaurant/ModernLayout";
import { GuiaPrecificacaoLayout } from "@/components/guia/GuiaPrecificacaoLayout";

export default function GuiaCompletoPrecificacao() {
  return (
    <ModernLayout>
      <GuiaPrecificacaoLayout />
    </ModernLayout>
  );
}