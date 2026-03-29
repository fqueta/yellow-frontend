import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { systemSettingsService } from '@/services/systemSettingsService';

export function StoreWarningPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPopupSettings = async () => {
      try {
         // Buscamos as configurações avançadas / options
         const data = await systemSettingsService.getAdvancedSettings('/options');
         
         if (data.habilitar_popup_cliente === 's' && data.mensagem_popup_cliente) {
             // Usa sessionStorage para exibir o popup apenas uma vez por sessão (aba)
             const hasSeenPopup = sessionStorage.getItem('store_popup_seen');
             if (!hasSeenPopup) {
                 setMessage(data.mensagem_popup_cliente);
                 setIsOpen(true);
             }
         }
      } catch (error) {
         console.error('Erro ao verificar configurações do popup da loja', error);
      } finally {
         setIsLoading(false);
      }
    };
    
    checkPopupSettings();
  }, []);

  const handleClose = () => {
      setIsOpen(false);
      sessionStorage.setItem('store_popup_seen', 'true');
  };

  if (isLoading || !message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-md border-orange-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600 text-xl">
            <AlertCircle className="w-6 h-6" />
            Aviso Importante
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div 
            className="text-sm text-gray-700 min-h-[50px] space-y-2 [&>a]:text-blue-600 [&>a]:underline" 
            dangerouslySetInnerHTML={{ __html: message }} 
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleClose} className="bg-orange-500 hover:bg-orange-600 font-bold px-8">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
