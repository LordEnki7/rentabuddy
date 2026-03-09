import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { SafetyReportDialog } from "./SafetyReportDialog";

interface ActiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  buddyName: string;
  buddyImage?: string;
  buddyUserId?: string;
  bookingId?: string;
}

export function ActiveCallModal({ isOpen, onClose, buddyName, buddyImage, buddyUserId, bookingId }: ActiveCallModalProps) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [showSafetyReport, setShowSafetyReport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus("Connecting...");
      setDuration(0);
      
      // Simulate connection after 2 seconds
      const connectTimer = setTimeout(() => {
        setStatus("Connected");
      }, 2000);

      // Start timer
      const timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      return () => {
        clearTimeout(connectTimer);
        clearInterval(timer);
      };
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white p-0 overflow-hidden">
        <div className="flex flex-col items-center justify-between h-[500px] p-8 relative">
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/90 z-0"></div>
          
          <div className="z-10 w-full flex flex-col items-center mt-8">
            <Avatar className="h-32 w-32 border-4 border-white/10 shadow-2xl mb-6">
              <AvatarImage src={buddyImage} />
              <AvatarFallback className="text-4xl bg-slate-800">{buddyName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <h2 className="text-3xl font-heading font-bold tracking-tight mb-2">{buddyName}</h2>
            <p className="text-primary font-medium flex items-center gap-2 animate-pulse">
              {status === "Connected" ? formatTime(duration) : status}
            </p>
            
            {status === "Connected" && (
              <div className="mt-4 px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-white/50 border border-white/10">
                Secure Line • Encrypted
              </div>
            )}
          </div>

          <div className="z-10 w-full grid grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center gap-2">
              <Button 
                variant="secondary" 
                size="icon" 
                className={`h-14 w-14 rounded-full transition-all ${isMuted ? 'bg-white text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white border-0'}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
              <span className="text-xs text-white/50">Mute</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-14 w-14 rounded-full shadow-lg shadow-red-500/20 hover:scale-110 transition-transform"
                onClick={onClose}
              >
                <PhoneOff className="h-6 w-6 fill-current" />
              </Button>
              <span className="text-xs text-white/50">End</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
              <span className="text-xs text-white/50">Speaker</span>
            </div>
          </div>

          {/* Safety Action */}
          <div className="z-10 w-full px-8">
            <Button
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
              onClick={() => setShowSafetyReport(true)}
              data-testid="button-report-safety-call"
            >
              Report Safety Issue
            </Button>
          </div>
        </div>
      </DialogContent>

      <SafetyReportDialog
        isOpen={showSafetyReport}
        onClose={() => setShowSafetyReport(false)}
        reportedUserId={buddyUserId}
        bookingId={bookingId}
        contextLabel={`Call with ${buddyName}`}
      />
    </Dialog>
  );
}
