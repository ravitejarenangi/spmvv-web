"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  Plus,
  Save,
  Loader2,
  Server,
  Brain,
  MessageSquare,
  Palette,
  Shield,
  FileText,
  Globe,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Setting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  description: string | null;
}

interface AllowedDomain {
  id: string;
  domain: string;
  isActive: boolean;
}

interface SettingsFormProps {
  initialSettings: Setting[];
  initialDomains: AllowedDomain[];
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: typeof Server; description: string; color: string }
> = {
  ai: {
    label: "Ollama (Local AI)",
    icon: Server,
    description: "Configure the local Ollama server for embeddings and generation",
    color: "text-green-600 bg-green-50",
  },
  ollama: {
    label: "Provider Selection",
    icon: Server,
    description: "Choose the active generation provider",
    color: "text-green-600 bg-green-50",
  },
  zai: {
    label: "Z.AI (Cloud AI)",
    icon: Zap,
    description: "Configure Z.AI cloud API for chat generation",
    color: "text-violet-600 bg-violet-50",
  },
  rag: {
    label: "RAG Pipeline",
    icon: Brain,
    description: "Tune retrieval, chunking, and reranking parameters",
    color: "text-blue-600 bg-blue-50",
  },
  chat: {
    label: "Chat",
    icon: MessageSquare,
    description: "Configure chat behavior, streaming, and prompts",
    color: "text-orange-600 bg-orange-50",
  },
  site: {
    label: "Branding",
    icon: Palette,
    description: "Customize the application name and content",
    color: "text-pink-600 bg-pink-50",
  },
  auth: {
    label: "Authentication",
    icon: Shield,
    description: "Control registration and default user settings",
    color: "text-red-600 bg-red-50",
  },
  documents: {
    label: "Documents",
    icon: FileText,
    description: "Configure document upload and processing limits",
    color: "text-amber-600 bg-amber-50",
  },
};

// Friendly display names for setting keys
const KEY_LABELS: Record<string, string> = {
  ollama_url: "Server URL",
  embedding_model: "Embedding Model",
  generation_model: "Generation Model",
  generation_provider: "Active Provider",
  zai_api_url: "API Endpoint",
  zai_api_key: "API Key",
  zai_model: "Model Name",
  chunk_size: "Chunk Size (chars)",
  chunk_overlap: "Chunk Overlap (chars)",
  top_k_retrieval: "Top-K Results",
  reranker_top_n: "Reranker Top-N",
  pdf_search_keywords: "PDF Search Keywords",
  streaming_enabled: "Enable Streaming",
  system_prompt: "System Prompt",
  max_chat_sessions: "Max Sessions Per User",
  site_name: "Site Name",
  welcome_text: "Welcome Message",
  about_content: "About Page Content",
  registration_enabled: "Allow Registration",
  default_role: "Default User Role",
  max_upload_size_mb: "Max Upload Size (MB)",
};

// Settings that should render as dropdowns with predefined options
const DROPDOWN_OPTIONS: Record<string, { value: string; label: string }[]> = {
  generation_provider: [
    { value: "ollama", label: "Ollama (Local)" },
    { value: "zai", label: "Z.AI (Cloud)" },
  ],
  default_role: [
    { value: "student", label: "Student" },
    { value: "faculty", label: "Faculty" },
  ],
  zai_model: [
    { value: "GLM-5", label: "GLM-5" },
    { value: "GLM-5-Turbo", label: "GLM-5 Turbo" },
    { value: "GLM-4.7", label: "GLM-4.7" },
    { value: "GLM-4.6", label: "GLM-4.6" },
    { value: "GLM-4.5", label: "GLM-4.5" },
  ],
  generation_model: [
    { value: "mistral", label: "Mistral 7B" },
    { value: "llama3", label: "Llama 3" },
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "gemma2", label: "Gemma 2" },
    { value: "phi3", label: "Phi-3" },
    { value: "qwen2", label: "Qwen 2" },
  ],
  embedding_model: [
    { value: "nomic-embed-text", label: "Nomic Embed Text" },
    { value: "mxbai-embed-large", label: "MxBai Embed Large" },
    { value: "all-minilm", label: "All-MiniLM" },
    { value: "snowflake-arctic-embed", label: "Snowflake Arctic Embed" },
  ],
};

function inferType(value: unknown): "boolean" | "number" | "array" | "textarea" | "password" | "text" {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "array";
  if (typeof value === "string" && value.length > 80) return "textarea";
  return "text";
}

function isSecretKey(key: string): boolean {
  return key.includes("api_key") || key.includes("secret");
}

export function SettingsForm({ initialSettings, initialDomains }: SettingsFormProps) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [domains, setDomains] = useState<AllowedDomain[]>(initialDomains);
  const [newDomain, setNewDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Group settings by category
  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  function updateValue(key: string, value: unknown) {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  }

  function toggleDomain(domain: string) {
    setDomains((prev) =>
      prev.map((d) => (d.domain === domain ? { ...d, isActive: !d.isActive } : d))
    );
  }

  function removeDomain(domain: string) {
    setDomains((prev) => prev.filter((d) => d.domain !== domain));
  }

  function addDomain() {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) return;
    if (domains.find((d) => d.domain === trimmed)) {
      toast.error("Domain already exists");
      return;
    }
    setDomains((prev) => [
      ...prev,
      { id: crypto.randomUUID(), domain: trimmed, isActive: true },
    ]);
    setNewDomain("");
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updates = settings.map((s) => ({ key: s.key, value: s.value }));
      const activeDomains = domains.filter((d) => d.isActive).map((d) => d.domain);
      const removedDomains = initialDomains
        .filter((d) => d.isActive && !activeDomains.includes(d.domain))
        .map((d) => d.domain);
      const addedDomains = activeDomains.filter(
        (d) => !initialDomains.find((id) => id.domain === d && id.isActive)
      );

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates,
          domains: { add: addedDomains, remove: removedDomains },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Failed to save settings");
      }
      toast.success("Settings saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function renderInput(setting: Setting) {
    const type = inferType(setting.value);
    const label = KEY_LABELS[setting.key] || setting.key.replace(/_/g, " ");
    const secret = isSecretKey(setting.key);
    const dropdownOpts = DROPDOWN_OPTIONS[setting.key];

    // Dropdown select for predefined options
    if (dropdownOpts) {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key} className="text-sm font-medium text-slate-800">
            {label}
          </Label>
          {setting.description && (
            <p className="text-xs text-slate-500">{setting.description}</p>
          )}
          <Select
            value={String(setting.value ?? "")}
            onValueChange={(val) => val && updateValue(setting.key, val)}
          >
            <SelectTrigger className="max-w-[300px] rounded-lg border-slate-200 bg-white">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {dropdownOpts.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (type === "boolean") {
      return (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/50">
          <div className="space-y-0.5">
            <Label htmlFor={setting.key} className="text-sm font-medium text-slate-800 cursor-pointer">
              {label}
            </Label>
            {setting.description && (
              <p className="text-xs text-slate-500">{setting.description}</p>
            )}
          </div>
          <Switch
            id={setting.key}
            checked={Boolean(setting.value)}
            onCheckedChange={(val) => updateValue(setting.key, val)}
          />
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key} className="text-sm font-medium text-slate-800">
            {label}
          </Label>
          {setting.description && (
            <p className="text-xs text-slate-500">{setting.description}</p>
          )}
          <Textarea
            id={setting.key}
            value={String(setting.value ?? "")}
            onChange={(e) => updateValue(setting.key, e.target.value)}
            rows={5}
            className="min-h-[120px] rounded-lg border-slate-200 bg-white font-mono text-sm focus:border-blue-500 focus:ring-blue-500/20"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
          {setting.key === "system_prompt" && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-md px-3 py-1.5">
              Must include <code className="font-mono font-bold">{"{context}"}</code> and <code className="font-mono font-bold">{"{question}"}</code> placeholders
            </p>
          )}
        </div>
      );
    }

    if (type === "number") {
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key} className="text-sm font-medium text-slate-800">
            {label}
          </Label>
          {setting.description && (
            <p className="text-xs text-slate-500">{setting.description}</p>
          )}
          <Input
            id={setting.key}
            type="number"
            value={String(setting.value)}
            onChange={(e) => updateValue(setting.key, Number(e.target.value))}
            className="max-w-[200px] rounded-lg border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      );
    }

    if (type === "array") {
      const arr = Array.isArray(setting.value) ? (setting.value as string[]) : [];
      return (
        <div className="space-y-2">
          <Label htmlFor={setting.key} className="text-sm font-medium text-slate-800">
            {label}
          </Label>
          {setting.description && (
            <p className="text-xs text-slate-500">{setting.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {arr.map((item, i) => (
              <Badge key={i} variant="secondary" className="rounded-md bg-blue-50 text-blue-700 border-0 px-2.5 py-1">
                {item}
              </Badge>
            ))}
          </div>
          <Input
            id={setting.key}
            value={arr.join(", ")}
            onChange={(e) =>
              updateValue(
                setting.key,
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="max-w-md rounded-lg border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
            placeholder="Comma-separated values"
          />
        </div>
      );
    }

    // Text input (default)
    return (
      <div className="space-y-2">
        <Label htmlFor={setting.key} className="text-sm font-medium text-slate-800">
          {label}
        </Label>
        {setting.description && (
          <p className="text-xs text-slate-500">{setting.description}</p>
        )}
        <div className="relative max-w-md">
          <Input
            id={setting.key}
            type={secret && !showSecrets[setting.key] ? "password" : "text"}
            value={String(setting.value ?? "")}
            onChange={(e) => updateValue(setting.key, e.target.value)}
            className="rounded-lg border-slate-200 bg-white pr-16 focus:border-blue-500 focus:ring-blue-500/20"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
          {secret && (
            <button
              type="button"
              onClick={() =>
                setShowSecrets((prev) => ({
                  ...prev,
                  [setting.key]: !prev[setting.key],
                }))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded transition-colors"
            >
              {showSecrets[setting.key] ? "Hide" : "Show"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={categories[0]} className="w-full space-y-6" orientation="horizontal">
        {/* Tab navigation */}
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto gap-1 rounded-xl bg-slate-100 p-1">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta?.icon || Server;
              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{meta?.label || cat}</span>
                </TabsTrigger>
              );
            })}
            {/* Domains tab */}
            <TabsTrigger
              value="domains"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Globe className="size-4" />
              <span className="hidden sm:inline">Email Domains</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Category panels */}
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta?.icon || Server;
          const items = grouped[cat];

          return (
            <TabsContent key={cat} value={cat} className="w-full space-y-6 mt-0">
              {/* Category header */}
              <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <div className={`rounded-lg p-2.5 ${meta?.color || "text-slate-600 bg-slate-50"}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {meta?.label || cat}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {meta?.description || `Configure ${cat} settings`}
                  </p>
                </div>
              </div>

              {/* Settings fields */}
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                {items.map((setting, idx) => {
                  const type = inferType(setting.value);
                  // Boolean settings get their own row treatment
                  if (type === "boolean") {
                    return (
                      <div key={setting.key} className="px-5 py-1">
                        {renderInput(setting)}
                      </div>
                    );
                  }
                  return (
                    <div key={setting.key} className="px-5 py-4">
                      {renderInput(setting)}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}

        {/* Domains panel */}
        <TabsContent value="domains" className="w-full space-y-6 mt-0">
          <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="rounded-lg p-2.5 text-emerald-600 bg-emerald-50">
              <Globe className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Allowed Email Domains</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Control which email domains can register. Users with unlisted domains will be blocked.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
            {/* Active domains */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-800">Active Domains</Label>
              <div className="flex flex-wrap gap-2">
                {domains.filter((d) => d.isActive).length === 0 && (
                  <p className="text-sm text-slate-400 italic">
                    No active domains. All email domains will be blocked from registration.
                  </p>
                )}
                {domains
                  .filter((d) => d.isActive)
                  .map((d) => (
                    <div
                      key={d.domain}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800 font-medium transition-colors"
                    >
                      <span>@{d.domain}</span>
                      <button
                        type="button"
                        onClick={() => toggleDomain(d.domain)}
                        className="rounded-full p-0.5 text-emerald-500 hover:bg-emerald-100 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${d.domain}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Disabled domains */}
            {domains.filter((d) => !d.isActive).length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-500">Disabled Domains</Label>
                <div className="flex flex-wrap gap-2">
                  {domains
                    .filter((d) => !d.isActive)
                    .map((d) => (
                      <div
                        key={d.domain}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-sm text-slate-500 line-through transition-colors"
                      >
                        <span>@{d.domain}</span>
                        <button
                          type="button"
                          onClick={() => toggleDomain(d.domain)}
                          className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-emerald-600 transition-colors"
                          aria-label={`Re-enable ${d.domain}`}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Add new domain */}
            <div className="space-y-2">
              <Label htmlFor="new-domain" className="text-sm font-medium text-slate-800">
                Add New Domain
              </Label>
              <div className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                  <Input
                    id="new-domain"
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDomain();
                      }
                    }}
                    className="pl-7 rounded-lg border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={addDomain}
                  type="button"
                  className="rounded-lg border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                >
                  <Plus className="size-4 mr-1.5" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-10 -mx-6 px-6 py-4 bg-gradient-to-t from-slate-50 via-slate-50 to-slate-50/80 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Changes are saved to the database and take effect within 60 seconds.
          </p>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-6 h-11 font-medium shadow-sm transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
