import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Clock } from "lucide-react";
import { systemSettingsService } from "@/services/systemSettingsService";

export function PointExpirationSettings() {
  const [diasExpiracao, setDiasExpiracao] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await systemSettingsService.getAdvancedSettings('/options');
      setDiasExpiracao(data.pontos_dias_expiracao || "");
    } catch (error) {
      console.error("Erro ao carregar configurações de expiração:", error);
      toast.error("Não foi possível carregar as configurações de expiração.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Busca as configurações atuais para não sobrescrever as outras
      const currentSettings = await systemSettingsService.getAdvancedSettings('/options');
      
      const payload = {
        ...currentSettings,
        pontos_dias_expiracao: diasExpiracao,
      };

      await systemSettingsService.saveAdvancedSettings(payload);
      toast.success("Regras de expiração atualizadas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações de expiração:", error);
      toast.error("Ocorreu um erro ao salvar as configurações.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando configurações...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Regras de Expiração de Pontos</span>
        </CardTitle>
        <CardDescription>
          Configure o prazo padrão de validade para novos pontos de crédito gerados no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pontos_dias_expiracao">Dias para Expiração de Pontos</Label>
          <p className="text-sm text-muted-foreground">
            Defina quantos dias os pontos de crédito levam para expirar após a data de criação. Deixe vazio ou 0 para que os pontos nunca expirem.
          </p>
          <Input
            id="pontos_dias_expiracao"
            type="number"
            min="0"
            value={diasExpiracao}
            onChange={(e) => setDiasExpiracao(e.target.value)}
            placeholder="Ex: 365"
            className="max-w-md"
          />
        </div>

        <div className="flex justify-end pt-4 border-t mt-6">
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Salvando..." : "Salvar Regras"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
