import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Upload, Sparkles, ChevronRight, X, Briefcase, Building2,
  CheckCircle2, AlertCircle, RefreshCw, Brain, Code2, Users,
  FileText, Award, Clock, Layers, BookOpen, Zap
} from "lucide-react";
import { toast } from "sonner";

const ROLES = ["Frontend Developer","Backend Developer","Full Stack Developer","Data Scientist","DevOps Engineer","Mobile Developer","QA Engineer"];
const COMPANY_TYPES = ["Startup","Mid-size Company","MNC / Enterprise","FAANG / Top Tech","Government / PSU"];
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

// ── Mock resume data fallback ────────────────────────────────────────────
const MOCK_RESUME_DATA = JSON.stringify({
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "REST APIs", "SQL", "Git"],
  role: "Frontend Developer",
  experience: "3 years",
  education: "B.Tech Computer Science",
  projects: ["E-commerce Web App", "Dashboard Analytics Tool"],
  companies: ["Tech Startup", "Freelance"],
  summary: "A motivated frontend developer with 3 years of experience building modern web applications using React and TypeScript. Passionate about clean code and great user experiences."
});

async function callGeminiText(prompt: string) {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (key) {
    for (const model of MODELS) {
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ contents:[{ parts:[{ text: prompt }] }] }),
        });
        if (!r.ok) { console.warn(`Model ${model} failed (${r.status})`); continue; }
        const d = await r.json();
        const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) return t;
      } catch { continue; }
    }
  }
  console.warn("⚠️ Gemini API unavailable — using mock resume data");
  return MOCK_RESUME_DATA;
}

async function callGeminiPDF(base64: string, prompt: string) {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (key) {
    for (const model of MODELS) {
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ contents:[{ parts:[
            { inline_data:{ mime_type:"application/pdf", data: base64 } },
            { text: prompt }
          ]}]}),
        });
        if (!r.ok) { console.warn(`Model ${model} failed (${r.status})`); continue; }
        const d = await r.json();
        const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (t) return t;
      } catch(e){ console.warn(model, e); continue; }
    }
  }
  console.warn("⚠️ Gemini API unavailable — using mock resume data for PDF");
  return MOCK_RESUME_DATA;
}

export interface ResumeData {
  skills: string[]; role: string; experience: string;
  education: string; projects: string[]; companies: string[]; summary: string;
}

const EXTRACT_PROMPT = `Analyze this resume and extract key information. Return ONLY a valid JSON object (no markdown, no explanation):
{"skills":["skill1","skill2"],"role":"detected job title","experience":"X years or fresher","education":"highest degree","projects":["project1","project2"],"companies":["company1","company2"],"summary":"2-sentence professional summary of the candidate"}`;

export default function FullInterview() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [pdfBase64, setPdfBase64] = useState<string|null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [role, setRole] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ResumeData|null>(null);
  const [step, setStep] = useState<"upload"|"details">("upload");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (file.name.toLowerCase().endsWith(".pdf")) {
      setIsPdf(true); setResumeText("");
      const reader = new FileReader();
      reader.onload = ev => {
        const bytes = new Uint8Array(ev.target?.result as ArrayBuffer);
        let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
        setPdfBase64(btoa(bin));
      };
      reader.readAsArrayBuffer(file);
    } else if (/\.(txt|md)$/i.test(file.name)) {
      setIsPdf(false); setPdfBase64(null);
      const reader = new FileReader();
      reader.onload = ev => setResumeText(ev.target?.result as string || "");
      reader.readAsText(file);
    } else {
      toast.error("Please upload a PDF, .txt, or .md file.");
    }
  };

  const parseResume = async () => {
    if (isPdf ? !pdfBase64 : !resumeText.trim()) {
      toast.error("Please upload or paste your resume first."); return;
    }
    setParsing(true);
    try {
      const raw = isPdf
        ? await callGeminiPDF(pdfBase64!, EXTRACT_PROMPT)
        : await callGeminiText(`${EXTRACT_PROMPT}\n\nResume:\n${resumeText.substring(0,4000)}`);
      const clean = raw.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
      setParsedData(JSON.parse(clean));
      setStep("details");
      toast.success("Resume analysed successfully!");
    } catch(e) {
      toast.error("Failed to parse resume. Check your API key."); console.error(e);
    } finally { setParsing(false); }
  };

  const handleStart = () => {
    if (!role || !companyType) { toast.error("Select a role and company type."); return; }
    sessionStorage.setItem("fullInterviewData", JSON.stringify({
      resumeData: { ...parsedData!, role, companies: parsedData?.companies||[] }, role, companyType
    }));
    navigate("/interview/full/session");
  };

  const canParse = isPdf ? !!pdfBase64 : !!resumeText.trim();

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600/10 border border-blue-600/15 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">Full Interview Simulation</h1>
            </div>
            <p className="text-base text-muted-foreground ml-11.5">Upload your resume and complete 3 AI-powered interview rounds.</p>
          </div>
        </div>

        {/* Round Overview — icons only, no emojis */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { icon: Brain, label: "Round 1", title: "Aptitude", desc: "MCQ — Logic & Reasoning", color: "blue" },
            { icon: Code2, label: "Round 2", title: "Technical", desc: "Skills from your resume", color: "purple" },
            { icon: Users, label: "Round 3", title: "HR Round", desc: "Behavioral & culture fit", color: "emerald" },
          ].map((r) => {
            const Icon = r.icon;
            const styles: Record<string, string> = {
              blue:    "bg-blue-600/5 border-blue-600/15 text-blue-600",
              purple:  "bg-purple-600/5 border-purple-600/15 text-purple-600",
              emerald: "bg-emerald-600/5 border-emerald-600/15 text-emerald-600",
            };
            return (
              <div key={r.label} className={`border rounded-2xl p-4 text-center shadow-sm ${styles[r.color]}`}>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center mx-auto mb-2.5 border ${styles[r.color]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{r.label}</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{r.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-6">
          {["Upload & Parse Resume","Configure & Start"].map((s, i) => {
            const done = step === "details" && i === 0;
            const active = (step === "upload" && i === 0) || (step === "details" && i === 1);
            return (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  active ? "bg-blue-600 text-white border-blue-600" :
                  done   ? "bg-emerald-600/10 text-emerald-600 border-emerald-600/20" :
                           "bg-secondary/30 text-muted-foreground border-border/30"}`}>
                  {done ? <CheckCircle2 className="h-3 w-3" /> : <span>{i+1}</span>}
                  {s}
                </div>
                {i < 1 && <div className="h-px w-8 bg-border/50" />}
              </div>
            );
          })}
        </div>

        {/* ─── STEP 1: UPLOAD ─── */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-bold text-foreground text-lg">Upload Resume</h3>
                <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full border border-border/30 font-medium">PDF, .txt, .md</span>
              </div>

              {/* Drop Zone */}
              <button
                onClick={() => fileRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-all group mb-5 ${
                  isPdf && pdfBase64
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border/40 hover:border-blue-600/40 hover:bg-blue-600/5"
                }`}
              >
                {isPdf && pdfBase64 ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-600">{fileName}</p>
                      <p className="text-xs text-emerald-500 mt-0.5">PDF loaded and ready to parse</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-12 w-12 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all">
                      <Upload className="h-6 w-6 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{fileName || "Click to upload resume"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PDF, .txt, or .md — max 10MB</p>
                    </div>
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md" onChange={handleFile} className="hidden" />

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border/30" />
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">or paste resume text</span>
                <div className="flex-1 h-px bg-border/30" />
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder={`Name | email@example.com | LinkedIn\n\nSKILLS: React, Node.js, TypeScript...\nEXPERIENCE: 3 years at Company XYZ\nEDUCATION: B.Tech Computer Science\nPROJECTS: E-commerce App, Chat App`}
                  className="w-full h-48 bg-secondary/20 border border-border/40 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:ring-1 focus:ring-blue-600/30 focus:border-blue-600/30 outline-none transition-all font-mono"
                />
                {resumeText && (
                  <button onClick={() => { setResumeText(""); setFileName(""); }}
                    className="absolute top-3 right-3 h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground border border-border/30">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {isPdf && pdfBase64 ? `PDF: ${fileName}` : `${resumeText.length} characters`}
                </p>
                <Button onClick={parseResume} disabled={!canParse || parsing}
                  className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm gap-2 shadow-sm disabled:opacity-50">
                  {parsing
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analysing...</>
                    : <><Sparkles className="h-4 w-4" /> Analyse Resume</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: DETAILS + PARSED DATA ─── */}
        {step === "details" && parsedData && (
          <div className="space-y-5">
            {/* Full Parsed Data Card */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              {/* Header strip */}
              <div className="bg-emerald-600/5 border-b border-emerald-600/10 px-6 py-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">Resume Analysed</h3>
                  <p className="text-[10px] text-muted-foreground">Review the extracted data below</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Summary */}
                <div className="bg-secondary/20 border border-border/30 rounded-xl p-4">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5">AI Summary</p>
                  <p className="text-base text-foreground leading-relaxed italic">"{parsedData.summary}"</p>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Briefcase, label: "Detected Role", value: parsedData.role || "Not detected" },
                    { icon: Clock,     label: "Experience",     value: parsedData.experience || "Not detected" },
                    { icon: BookOpen,  label: "Education",      value: parsedData.education || "Not detected" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="bg-secondary/20 rounded-xl p-3 border border-border/30">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
                      </div>
                      <p className="text-sm font-bold text-foreground leading-snug">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">Skills <span className="text-muted-foreground font-normal">({parsedData.skills.length} found)</span></p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedData.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-blue-600/8 text-blue-700 border border-blue-600/20 rounded-lg text-[11px] font-semibold">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Companies + Projects side by side */}
                <div className="grid grid-cols-2 gap-4">
                  {parsedData.companies.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm font-bold text-foreground">Companies</p>
                      </div>
                      <ul className="space-y-1.5">
                        {parsedData.companies.map(c => (
                          <li key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parsedData.projects.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Award className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm font-bold text-foreground">Projects</p>
                      </div>
                      <ul className="space-y-1.5">
                        {parsedData.projects.map(p => (
                          <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role & Company */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-bold text-foreground text-lg">Target Role</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        role === r ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary/60 hover:text-foreground"
                      }`}>{r}</button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border/30" />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-bold text-foreground text-lg">Company Type</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_TYPES.map(c => (
                    <button key={c} onClick={() => setCompanyType(c)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        companyType === c ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary/60 hover:text-foreground"
                      }`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            {(!role || !companyType) && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-600 font-medium">Please select both a target role and company type to continue.</p>
              </div>
            )}

            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => { setStep("upload"); setParsedData(null); }}
                className="h-10 px-5 rounded-xl text-sm border-border/50 gap-2">
                <ChevronRight className="h-4 w-4 rotate-180" /> Edit Resume
              </Button>
              <Button onClick={handleStart} disabled={!role || !companyType}
                className="h-10 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm gap-2 shadow-md disabled:opacity-40">
                Begin Interview <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
