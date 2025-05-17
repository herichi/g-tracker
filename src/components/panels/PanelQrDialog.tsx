
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { QrCode, Clipboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PanelQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodeData: string;
  qrCodeImage?: string;
}

const PanelQrDialog: React.FC<PanelQrDialogProps> = ({ 
  open, 
  onOpenChange, 
  qrCodeData,
  qrCodeImage 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Panel QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code with the Doha Extraco app to view or update this panel's status.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6">
          <div className="w-64 h-64 bg-white flex items-center justify-center border">
            {qrCodeImage ? (
              <img src={qrCodeImage} alt="Panel QR Code" className="w-full h-full object-contain" />
            ) : (
              <QrCode size={200} />
            )}
            <p className="sr-only">{qrCodeData}</p>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(qrCodeData);
              toast({ 
                title: "QR Code Link Copied", 
                description: "Link has been copied to clipboard." 
              });
            }}
          >
            <Clipboard className="mr-2 h-4 w-4" /> Copy Link
          </Button>
          <Button 
            type="button" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PanelQrDialog;
