import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classifyCase } from "@/services/ai/gemini";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getLawyers, submitCaseToLawyer } from "@/services/backend";
import { useToast } from "@/hooks/use-toast";
import { UserPhoto } from "@/components/ui/UserPhoto";

const translations = {
  en: {
    title: "Submit New Case",
    subtitle: "Provide details about your legal issue and assign it directly to a registered lawyer.",
    beforeSubmit: "Before you submit",
    alertText: "Ensure all information is accurate. Your selected lawyer will immediately receive your case and first message.",
    caseTitle: "Case Title *",
    caseTitlePlaceholder: "Brief title describing your legal issue",
    chooseLawyer: "Choose Lawyer *",
    chooseLawyerPlaceholder: "Select a registered lawyer",
    caseType: "Case Type *",
    selectType: "Select case type",
    priority: "Priority Level *",
    selectPriority: "Select priority",
    description: "Case Description *",
    descPlaceholder: "Provide a detailed description of your legal issue.",
    minChars: "Minimum 50 characters recommended",
    documents: "Supporting Documents (Optional)",
    uploadText: "Drop files here or click to upload",
    uploadSubtext: "PDF, DOC, DOCX, JPG, PNG up to 10MB each",
    cancel: "Cancel",
    submit: "Submit Case",
    success: "Case submitted successfully!",
    noLawyers: "No registered lawyers are available yet.",
    priorities: [
      { value: "low", label: "Low", desc: "Non-urgent matter" },
      { value: "medium", label: "Medium", desc: "Standard timeline" },
      { value: "high", label: "High", desc: "Urgent attention needed" },
    ],
    types: ["Family Law", "Property Dispute", "Criminal Defense", "Employment Law", "Contract Dispute", "Other"],
  },
};

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const ACCEPTED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";

interface SubmitCaseProps {
  lang?: string;
}

const SubmitCase = ({ lang = "en" }: SubmitCaseProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations.en;

  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User" };

  const [formData, setFormData] = useState({
    title: "",
    lawyerId: "",
    caseType: "",
    priority: "",
    description: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    priority: string;
    reasoning: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    getLawyers()
      .then((data) => {
        setLawyers(Array.isArray(data.lawyers) ? data.lawyers.filter((lawyer) => lawyer.available) : []);
      })
      .catch(() => setLawyers([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedLawyerId = params.get("lawyerId");
    if (selectedLawyerId) {
      setFormData((prev) => ({ ...prev, lawyerId: selectedLawyerId }));
    }
  }, [location.search]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of selected) {
      if (!ACCEPTED_DOCUMENT_TYPES.has(file.type)) {
        rejected.push(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_DOCUMENT_SIZE) {
        rejected.push(`${file.name}: larger than 10MB`);
        continue;
      }
      accepted.push(file);
    }

    if (files.length + accepted.length > 10) {
      toast({
        title: "Too many files",
        description: "You can upload up to 10 supporting documents.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    if (accepted.length) {
      setFiles((prev) => [...prev, ...accepted]);
      toast({
        title: "Documents added",
        description: `${accepted.length} file${accepted.length === 1 ? "" : "s"} ready to submit.`,
      });
    }

    if (rejected.length) {
      toast({
        title: "Some files were not added",
        description: rejected.slice(0, 2).join(". "),
        variant: "destructive",
      });
    }

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const analyzeCase = async () => {
    if (!formData.title || !formData.description || formData.description.length < 20) return;
    setIsAnalyzing(true);
    try {
      const result = await classifyCase(formData.title, formData.description);
      setAiSuggestion(result);
      if (!formData.caseType && result.category) {
        setFormData((prev) => ({ ...prev, caseType: result.category }));
      }
      if (!formData.priority && result.priority) {
        setFormData((prev) => ({ ...prev, priority: result.priority }));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = [];
    if (!formData.title.trim()) missing.push("case title");
    if (!formData.lawyerId) missing.push("lawyer");
    if (!formData.caseType) missing.push("case type");
    if (!formData.priority) missing.push("priority");
    if (!formData.description.trim()) missing.push("description");

    if (missing.length) {
      toast({
        title: "Complete the case form",
        description: `Missing: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitCaseToLawyer({
        title: formData.title,
        caseType: formData.caseType,
        priority: formData.priority,
        description: formData.description,
        lawyerId: formData.lawyerId,
        initialMessage: formData.description,
        documents: files,
      });
      toast({ title: "Case submitted", description: t.success });
      navigate(`/messages?conversationId=${encodeURIComponent(result.conversation.id)}`);
    } catch (error: any) {
      toast({
        title: "Failed to submit case",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="citizen" userName={user?.name} lang={lang}>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold mb-1">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">{t.beforeSubmit}</h4>
            <p className="text-sm text-muted-foreground">{t.alertText}</p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="title">{t.caseTitle}</Label>
            <Input
              id="title"
              placeholder={t.caseTitlePlaceholder}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.chooseLawyer}</Label>
              <Select value={formData.lawyerId} onValueChange={(v) => setFormData({ ...formData, lawyerId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t.chooseLawyerPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {lawyers.map((lawyer) => (
                    <SelectItem key={lawyer.id} value={lawyer.id}>
                      {lawyer.name} - {Number(lawyer.hourlyRate || 0).toLocaleString()} RWF/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {lawyers.length === 0 && <p className="text-xs text-muted-foreground">{t.noLawyers}</p>}
              {formData.lawyerId && (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-border p-3">
                  {(() => {
                    const selected = lawyers.find((lawyer) => lawyer.id === formData.lawyerId);
                    if (!selected) return null;
                    return (
                      <>
                        <UserPhoto src={selected.avatarUrl} alt={selected.name} className="h-10 w-10 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{selected.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {selected.phone || "No phone"} · {Number(selected.hourlyRate || 0).toLocaleString()} RWF/hr
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.caseType}</Label>
              <Select value={formData.caseType} onValueChange={(v) => setFormData({ ...formData, caseType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t.selectType} />
                </SelectTrigger>
                <SelectContent>
                  {t.types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.priority}</Label>
            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
              <SelectTrigger>
                <SelectValue placeholder={t.selectPriority} />
              </SelectTrigger>
              <SelectContent>
                {t.priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className="font-medium">{p.label}</span> <span className="text-xs text-muted-foreground">({p.desc})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">{t.description}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={analyzeCase}
                disabled={isAnalyzing || !formData.title || formData.description.length < 20}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    AI Analyze
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              placeholder={t.descPlaceholder}
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">{t.minChars}</p>
          </div>

          {aiSuggestion && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Alert className="bg-primary/5 border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <p className="font-medium text-sm mb-2">AI Analysis Results:</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Suggested Category:</span> {aiSuggestion.category}
                    </p>
                    <p>
                      <span className="font-medium">Suggested Priority:</span> {aiSuggestion.priority}
                    </p>
                    <p className="text-muted-foreground italic">{aiSuggestion.reasoning}</p>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label>{t.documents}</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">{t.uploadText}</p>
              <p className="text-xs text-muted-foreground">{t.uploadSubtext}</p>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept={DOCUMENT_ACCEPT}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted/50 p-2 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>
              {t.cancel}
            </Button>
            <Button type="submit" className="gap-2" disabled={isSubmitting || lawyers.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" /> {t.submit}
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
};

export default SubmitCase;
