import { motion } from "framer-motion";
import { useState, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
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

const translations = {
  en: {
    title: "Submit New Case",
    subtitle: "Provide details about your legal issue. Our team will review and assign appropriate assistance.",
    beforeSubmit: "Before you submit",
    alertText: "Ensure all information is accurate. You can upload supporting documents now or later.",
    caseTitle: "Case Title *",
    caseTitlePlaceholder: "Brief title describing your legal issue",
    caseType: "Case Type *",
    selectType: "Select case type",
    priority: "Priority Level *",
    selectPriority: "Select priority",
    description: "Case Description *",
    descPlaceholder: "Provide a detailed description of your legal issue. Include relevant dates, parties involved, and any actions taken so far.",
    minChars: "Minimum 50 characters recommended",
    documents: "Supporting Documents (Optional)",
    uploadText: "Drop files here or click to upload",
    uploadSubtext: "PDF, DOC, DOCX, JPG, PNG up to 10MB each",
    cancel: "Cancel",
    submit: "Submit Case",
    success: "Case submitted successfully!",
    priorities: [
      { value: "low", label: "Low", desc: "Non-urgent matter" },
      { value: "medium", label: "Medium", desc: "Standard timeline" },
      { value: "high", label: "High", desc: "Urgent attention needed" },
    ],
    types: ["Family Law", "Property Dispute", "Criminal Defense", "Employment Law", "Contract Dispute", "Other"]
  },
  rw: {
    title: "Tanga Urubanza Rushya",
    subtitle: "Tanga amakuru arambuye ku kibazo ufite. Itsinda ryacu rizakigira ndetse rikuhe ubufasha bwiza.",
    beforeSubmit: "Mbere yo gutanga",
    alertText: "Higanwa ko amakuru yose ari ukuri. Ushobora gushyiraho inyandiko ubu cyangwa nyuma.",
    caseTitle: "Umutwe w'ikibazo *",
    caseTitlePlaceholder: "Inyito ngufi y'ikibazo ufite",
    caseType: "Ubwoko bw'ikibazo *",
    selectType: "Hitamo ubwoko",
    priority: "Urwego rw'ihuse *",
    selectPriority: "Hitamo uko bwihuse",
    description: "Ibisobanuro birambuye *",
    descPlaceholder: "Sobanura mu buryo burambuye ikibazo cyawe. Shyiramo amatariki, abantu bireba, n'ibyakozwe kugeza ubu.",
    minChars: "Byibuze inyuguti 50 zirakenewe",
    documents: "Inyandiko zunganira (Bihitiramo)",
    uploadText: "Kanda hano cyangwa ujugunye dosiye hano",
    uploadSubtext: "PDF, DOC, JPG kugeza kuri 10MB",
    cancel: "Hagarika",
    submit: "Tanga Urubanza",
    success: "Urubanza rwatanzwe neza!",
    priorities: [
      { value: "low", label: "Buhoro", desc: "Ntabwo byihutirwa" },
      { value: "medium", label: "Hagati", desc: "Bikurikiza gahunda" },
      { value: "high", label: "Cyane", desc: "Bikeneye kwitabwaho vuba" },
    ],
    types: ["Amategeko y'umuryango", "Imitungo", "Ibyaha", "Akazi", "Amasezerano", "Ibindi"]
  },
  fr: {
    title: "Soumettre un Nouveau Dossier",
    subtitle: "Fournissez les détails de votre problème juridique. Notre équipe examinera et assignera l'assistance appropriée.",
    beforeSubmit: "Avant de soumettre",
    alertText: "Assurez-vous que toutes les informations sont exactes. Vous pouvez télécharger des documents maintenant.",
    caseTitle: "Titre du Dossier *",
    caseTitlePlaceholder: "Titre bref décrivant votre problème",
    caseType: "Type de Dossier *",
    selectType: "Sélectionnez le type",
    priority: "Niveau de Priorité *",
    selectPriority: "Sélectionnez la priorité",
    description: "Description du Dossier *",
    descPlaceholder: "Fournissez une description détaillée. Incluez les dates, les parties impliquées et les actions déjà entreprises.",
    minChars: "Minimum 50 caractères recommandés",
    documents: "Documents de Soutien (Optionnel)",
    uploadText: "Déposez les fichiers ici ou cliquez pour télécharger",
    uploadSubtext: "PDF, DOC, JPG jusqu'à 10MB chacun",
    cancel: "Annuler",
    submit: "Soumettre le Dossier",
    success: "Dossier soumis avec succès!",
    priorities: [
      { value: "low", label: "Faible", desc: "Affaire non urgente" },
      { value: "medium", label: "Moyenne", desc: "Délai standard" },
      { value: "high", label: "Haute", desc: "Attention urgente requise" },
    ],
    types: ["Droit de la famille", "Litige foncier", "Droit pénal", "Droit du travail", "Contrats", "Autre"]
  }
};

interface SubmitCaseProps {
  lang?: string;
}

const SubmitCase = ({ lang = "en" }: SubmitCaseProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang as keyof typeof translations] || translations.en;
  
  const loggedInUser = localStorage.getItem("loggedInUser");
  const user = loggedInUser ? JSON.parse(loggedInUser) : { name: "User" };

  const [formData, setFormData] = useState({
    title: "",
    caseType: "",
    priority: "",
    description: "",
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    priority: string;
    reasoning: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // FUNCTIONALITY: Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // FUNCTIONALITY: AI-Powered Case Analysis
  const analyzeCase = async () => {
    if (!formData.title || !formData.description || formData.description.length < 20) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await classifyCase(formData.title, formData.description);
      setAiSuggestion(result);
      
      // Auto-fill if fields are empty
      if (!formData.caseType && result.category) {
        setFormData(prev => ({ ...prev, caseType: result.category.toLowerCase().replace(/ /g, '-') }));
      }
      if (!formData.priority && result.priority) {
        setFormData(prev => ({ ...prev, priority: result.priority }));
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // FUNCTIONALITY: Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Submitting:", { ...formData, attachedFiles: files, aiSuggestion });
    alert(t.success);
    navigate("/dashboard");
  };

  return (
    <DashboardLayout role="citizen" userName={user?.name} lang={lang}>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
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
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-sm"
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
              <Label>{t.caseType}</Label>
              <Select value={formData.caseType} onValueChange={(v) => setFormData({ ...formData, caseType: v })}>
                <SelectTrigger><SelectValue placeholder={t.selectType} /></SelectTrigger>
                <SelectContent>
                  {t.types.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.priority}</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger><SelectValue placeholder={t.selectPriority} /></SelectTrigger>
                <SelectContent>
                  {t.priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="font-medium">{p.label}</span> <span className="text-xs text-muted-foreground">({p.desc})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          {/* AI Suggestion Card */}
          {aiSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert className="bg-primary/5 border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <p className="font-medium text-sm mb-2">AI Analysis Results:</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Suggested Category:</span> {aiSuggestion.category}</p>
                    <p><span className="font-medium">Suggested Priority:</span> {aiSuggestion.priority}</p>
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
              <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>

            {/* File Preview List */}
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
            <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>{t.cancel}</Button>
            <Button type="submit" className="gap-2">
              <CheckCircle className="w-4 h-4" /> {t.submit}
            </Button>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
};

export default SubmitCase;