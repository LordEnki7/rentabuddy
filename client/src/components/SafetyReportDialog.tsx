import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const REPORT_CATEGORIES = [
  { value: "harassment", label: "Harassment", severity: "high", description: "Unwanted contact, threats, or intimidation" },
  { value: "inappropriate_behavior", label: "Inappropriate Behavior", severity: "high", description: "Conduct that violates community standards" },
  { value: "safety_concern", label: "Safety Concern", severity: "critical", description: "Immediate risk to physical or emotional safety" },
  { value: "policy_violation", label: "Policy Violation", severity: "medium", description: "Breach of platform terms or guidelines" },
  { value: "solicitation", label: "Solicitation", severity: "high", description: "Inappropriate solicitation or off-platform transactions" },
] as const;

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical": return "bg-red-100 text-red-800 border-red-300";
    case "high": return "bg-orange-100 text-orange-800 border-orange-300";
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default: return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

interface SafetyReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId?: string;
  bookingId?: string;
  contextLabel?: string;
}

export function SafetyReportDialog({ isOpen, onClose, reportedUserId, bookingId, contextLabel }: SafetyReportDialogProps) {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const selectedCategoryInfo = REPORT_CATEGORIES.find(c => c.value === selectedCategory);

  const handleReset = () => {
    setStep("form");
    setSelectedCategory("");
    setDescription("");
    setSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !description.trim()) return;

    setSubmitting(true);
    try {
      await api.createSafetyReport({
        reportedUserId: reportedUserId || "unknown",
        bookingId: bookingId || null,
        category: selectedCategory,
        description: description.trim(),
      });

      queryClient.invalidateQueries({ queryKey: ["mySafetyReports"] });
      setStep("success");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to submit report",
        description: error.message || "Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2" data-testid="heading-safety-report">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                Report a Safety Issue
              </DialogTitle>
              <DialogDescription>
                {contextLabel
                  ? `Reporting issue related to: ${contextLabel}`
                  : "Your safety is our top priority. Please describe the issue below."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Select a category</Label>
                <div className="grid gap-2">
                  {REPORT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                        selectedCategory === cat.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`button-category-${cat.value}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{cat.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${getSeverityColor(cat.severity)}`}>
                            {cat.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-description" className="text-sm font-semibold">
                  Describe what happened
                </Label>
                <textarea
                  id="report-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details about the incident..."
                  className="w-full min-h-[100px] p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  data-testid="textarea-report-description"
                />
              </div>

              <Button
                className="w-full"
                disabled={!selectedCategory || !description.trim()}
                onClick={() => setStep("confirm")}
                data-testid="button-review-report"
              >
                Review Report
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && selectedCategoryInfo && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2" data-testid="heading-confirm-report">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Your Report
              </DialogTitle>
              <DialogDescription>
                Please review the details before submitting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Category</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">{selectedCategoryInfo.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${getSeverityColor(selectedCategoryInfo.severity)}`}>
                      {selectedCategoryInfo.severity}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Description</p>
                  <p className="text-sm mt-1" data-testid="text-report-preview">{description}</p>
                </div>
              </div>

              {selectedCategoryInfo.severity === "critical" && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">
                    This is flagged as a critical safety concern. Our team will prioritize this report and may reach out to you directly.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("form")}
                  data-testid="button-back-to-edit"
                >
                  Edit Report
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting}
                  data-testid="button-submit-report"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold" data-testid="heading-report-success">Report Submitted</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Thank you for helping keep our community safe. Our trust & safety team will review your report and take appropriate action.
              </p>
            </div>
            <Button onClick={handleClose} data-testid="button-close-report">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
