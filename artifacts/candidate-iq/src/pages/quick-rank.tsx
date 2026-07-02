import React, { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useQuickRank } from "@/hooks/use-quick-rank";
import { ArrowLeft, Sparkles, Upload, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const DEMO_JD = `Job Description: Senior AI Engineer - Founding Team
Company: Redrob AI, a Series A AI-native talent intelligence platform
Location: Pune/Noida, India. Hybrid, flexible cadence. Open to relocation candidates from Tier-1 Indian cities.
Experience Required: 5-9 years preferred.

We need a senior AI engineer to own the intelligence layer of Redrob's product: the ranking, retrieval, and matching systems that decide what recruiters see when searching for candidates.

Must-have experience:
- Production embeddings-based retrieval systems deployed to real users
- Vector databases or hybrid search infrastructure such as Pinecone, Weaviate, Qdrant, Milvus, OpenSearch, Elasticsearch, or FAISS
- Strong Python and production ML engineering
- Ranking system evaluation using NDCG, MRR, MAP, offline benchmarks, online A/B tests, and recruiter feedback loops
- Ability to ship scrappy product-facing ML systems, not just research prototypes

Nice-to-have:
- LLM fine-tuning, LoRA, QLoRA, or PEFT
- Learning-to-rank models such as XGBoost or neural rankers
- HR-tech, recruiting-tech, marketplace, recommendation, or search product experience
- Distributed systems or large-scale inference optimization

We do not want shallow keyword-only AI profiles. Strong candidates may have built recommendation, retrieval, search, or matching systems even if they do not list every fashionable framework. Down-rank candidates with only toy LangChain demos, pure research with no deployment, or non-engineering profiles with AI keywords.`;

export default function QuickRankPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const quickRank = useQuickRank();

  const [jdText, setJdText] = useState("");
  const [topN, setTopN] = useState([15]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<"pdf" | "docx" | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const docxInputRef = useRef<HTMLInputElement>(null);

  const charCount = jdText.trim().length;
  const isValid = charCount >= 20;

  const handleLoadDemo = () => {
    setJdText(DEMO_JD);
  };

  const handleUpload = async (file: File | undefined, expectedType: "pdf" | "docx") => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(`.${expectedType}`)) {
      toast({
        title: "Wrong file type",
        description: `Please upload a ${expectedType.toUpperCase()} file.`,
        variant: "destructive",
      });
      return;
    }

    setUploadingType(expectedType);
    try {
      const response = await fetch("/api/documents/extract", {
        method: "POST",
        headers: {
          "Content-Type": file.type || (
            expectedType === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ),
          "X-File-Name": encodeURIComponent(file.name),
        },
        body: file,
      });

      const responseText = await response.text();
      let payload: { error?: string; text?: string; characters?: number } = {};
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        payload = {};
      }
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Upload backend is not running the latest code. Restart the API server, then try again.");
        }
        throw new Error(payload.error || `Could not extract text from this document. Server returned ${response.status}.`);
      }

      if (!payload.text) {
        throw new Error("The backend did not return extracted text. Restart the API server, then try again.");
      }

      setJdText(payload.text);
      toast({
        title: "Document loaded",
        description: `Extracted ${Number(payload.characters ?? payload.text.length).toLocaleString()} characters from ${file.name}.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please paste the JD text directly.",
        variant: "destructive",
      });
    } finally {
      setUploadingType(null);
    }
  };

  const handleRank = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      const result = await quickRank.mutateAsync({
        jd_text: jdText.trim(),
        top_n: topN[0],
      });

      if (typeof window !== "undefined") {
        sessionStorage.setItem("quickRankData", JSON.stringify(result));
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
      navigate("/quick-rank/results");
    } catch (error) {
      toast({
        title: "Ranking failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-1 -ml-2 mb-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-5xl font-serif font-light text-slate-900 leading-tight dark:text-slate-100">
          Curate the shortlist
        </h1>
        <p className="text-lg text-slate-600 font-light max-w-2xl dark:text-slate-300">
          Paste a brief, understand the nuance, and let SkillDock surface the people worth remembering.
        </p>
      </div>

      {/* Main Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900">
                Brief
              </label>
              <button
                onClick={handleLoadDemo}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                ← Load Demo
              </button>
            </div>

            {/* Input Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-slate-50/50 hover:bg-slate-100/50 focus-within:bg-slate-100 focus-within:border-amber-400 transition-all">
              <Textarea
                placeholder="Paste your brief here, or upload a PDF/DOCX file..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="min-h-64 border-0 bg-transparent text-slate-900 placeholder:text-slate-400 focus:ring-0 resize-none text-base"
              />
            </div>

            {/* Character Count */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {charCount.toLocaleString()} characters
              </span>
              {isValid && (
                <span className="text-green-600 font-medium">✓ Ready to rank</span>
              )}
            </div>

            {/* Upload Buttons */}
            <div className="flex gap-2">
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  void handleUpload(event.target.files?.[0], "pdf");
                  event.target.value = "";
                }}
              />
              <input
                ref={docxInputRef}
                type="file"
                accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
                className="hidden"
                onChange={(event) => {
                  void handleUpload(event.target.files?.[0], "docx");
                  event.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                disabled={uploadingType !== null}
                onClick={() => pdfInputRef.current?.click()}
              >
                {uploadingType === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                {uploadingType === "pdf" ? "Reading PDF..." : "Upload PDF"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                disabled={uploadingType !== null}
                onClick={() => docxInputRef.current?.click()}
              >
                {uploadingType === "docx" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                {uploadingType === "docx" ? "Reading DOCX..." : "Upload DOCX"}
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="space-y-4 lg:border-l lg:border-slate-200 lg:pl-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 block">
              Number of Candidates
            </label>
            <Card className="border-slate-200">
              <CardContent className="pt-6 space-y-4">
                <Slider
                  min={5}
                  max={50}
                  step={5}
                  value={topN}
                  onValueChange={setTopN}
                  className="w-full"
                />
                <div className="text-center">
                  <div className="text-3xl font-light font-serif text-amber-600">
                    {topN[0]}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">candidates to rank</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleRank}
            disabled={!isValid || isLoading}
            className="w-full h-12 bg-[color:var(--accent)] text-white font-semibold gap-2 text-base hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ranking...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start Ranking
              </>
            )}
          </Button>

          {/* Features */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-900">
              What you'll get
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                Match score for each candidate
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                AI reasoning for matches
              </li>
              <li className="flex gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                Downloadable results
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200 bg-slate-50/50">
          <CardContent className="pt-6">
            <Sparkles className="h-6 w-6 text-amber-600 mb-3" />
            <h3 className="font-semibold text-slate-900 text-sm mb-1">
              Instant Matches
            </h3>
            <p className="text-xs text-slate-600">
              See the strongest matches unfold with calm precision
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50/50">
          <CardContent className="pt-6">
            <Upload className="h-6 w-6 text-blue-600 mb-3" />
            <h3 className="font-semibold text-slate-900 text-sm mb-1">
              Multiple Formats
            </h3>
            <p className="text-xs text-slate-600">
              Paste text, upload PDF, or upload DOCX files
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50/50">
          <CardContent className="pt-6">
            <div className="h-6 w-6 text-green-600 mb-3 font-bold text-lg">✓</div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">
              Explainable AI
            </h3>
            <p className="text-xs text-slate-600">
              Understand why each candidate matches
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
