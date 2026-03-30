import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export const StoreWarningPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the warning in this session
    const hasSeenWarning = sessionStorage.getItem('hasSeenStorePolicyWarning');
    if (!hasSeenWarning) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenStorePolicyWarning', 'true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-7 w-7 text-yellow-500" />
            <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
              Comunicado Importante – Atualização na Política de Pontos
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="text-gray-700 space-y-4">
          <p><strong>Prezados Antenistas,</strong></p>
          <p>Informamos que haverá mudanças na política de pontos do Programa.</p>
          
          <h4 className="font-bold text-lg mt-4 text-purple-800">O que muda:</h4>
          
          <div className="bg-yellow-50/80 p-4 rounded-md border border-yellow-200 space-y-3">
            <h5 className="font-bold text-yellow-900">Para os novos pontos:</h5>
            <ul className="list-disc pl-5 space-y-2 text-yellow-900 leading-relaxed">
              <li>Os pontos acumulados passarão a ter validade de <strong>90 dias corridos</strong>, contados a partir da data em que forem creditados na conta do participante. Após esse prazo, os pontos expiram automaticamente.</li>
              <li>Os pontos passarão a ser transferidos automaticamente para a plataforma de resgate Yellow no momento em que forem gerados, não sendo mais necessária a solicitação de transferência pelo Portal do Antenista.</li>
            </ul>
          </div>

          <div className="bg-blue-50/80 p-4 rounded-md border border-blue-200 mt-4 space-y-3">
            <h5 className="font-bold text-blue-900">Para os pontos já acumulados:</h5>
            <ul className="list-disc pl-5 space-y-2 text-blue-900 leading-relaxed">
              <li>Os pontos acumulados antes da entrada em vigor da nova política serão transferidos automaticamente para a plataforma Yellow.</li>
              <li>Após a transferência, esses pontos passarão a ter validade de <strong>90 dias corridos</strong>, contados a partir da data da transferência para a plataforma.</li>
              <li>Após esse prazo, os pontos não utilizados serão automaticamente expirados.</li>
            </ul>
          </div>

          <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <p className="text-gray-800"><strong>Vigência da nova política:</strong><br />
            A nova política entrará em vigor em <strong>15/04/2026</strong>.</p>
          </div>

          <div className="bg-red-50 p-4 rounded-md text-red-800 text-sm mt-4 border border-red-100">
            <strong>Observação:</strong><br />
            Os pontos expirados serão automaticamente cancelados, sem possibilidade de reativação, indenização, restituição ou qualquer tipo de compensação.
          </div>

          <p className="font-bold text-center mt-6 text-purple-800 text-lg">
            Reforçamos a importância de acompanhar o saldo e utilizar os pontos dentro do prazo.
          </p>
        </div>

        <DialogFooter className="mt-6 flex sm:justify-center">
          <Button onClick={handleClose} size="lg" className="w-full sm:w-1/2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg">
            Estou ciente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
