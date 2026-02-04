import { useState } from "react";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TelegramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TelegramDialog = ({ open, onOpenChange }: TelegramDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cream border-gold/30 max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#0088cc] flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="font-display text-2xl text-sepia">
            Связаться с нами
          </DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            Присоединяйтесь к нашему Telegram-каналу для получения актуальной информации о проекте
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6 space-y-4">
          <a
            href="https://t.me/strategy_legacy"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full btn-primary-heritage text-center"
          >
            Открыть Telegram
          </a>
          
          <p className="text-center font-body text-xs text-muted-foreground">
            @strategy_legacy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TelegramDialog;
