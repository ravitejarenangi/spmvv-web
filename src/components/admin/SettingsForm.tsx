"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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

function inferType(value: unknown): "boolean" | "number" | "array" | "textarea" | "text" {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "array";
  if (typeof value === "string" && value.length > 80) return "textarea";
  return "text";
}

export function SettingsForm({ initialSettings, initialDomains }: SettingsFormProps) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [domains, setDomains] = useState<AllowedDomain[]>(initialDomains);
  const [newDomain, setNewDomain] = useState("");
  const [saving, setSaving] = useState(false);

  // Group settings by category
  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

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
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function renderInput(setting: Setting) {
    const type = inferType(setting.value);

    if (type === "boolean") {
      return (
        <Switch
          checked={Boolean(setting.value)}
          onCheckedChange={(val) => updateValue(setting.key, val)}
        />
      );
    }

    if (type === "number") {
      return (
        <Input
          type="number"
          value={String(setting.value)}
          onChange={(e) => updateValue(setting.key, Number(e.target.value))}
          className="max-w-xs"
        />
      );
    }

    if (type === "array") {
      const arr = Array.isArray(setting.value) ? (setting.value as string[]) : [];
      return (
        <Input
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
          className="max-w-sm"
          placeholder="Comma-separated values"
        />
      );
    }

    if (type === "textarea") {
      return (
        <Textarea
          value={String(setting.value ?? "")}
          onChange={(e) => updateValue(setting.key, e.target.value)}
          rows={4}
        />
      );
    }

    return (
      <Input
        value={String(setting.value ?? "")}
        onChange={(e) => updateValue(setting.key, e.target.value)}
        className="max-w-sm"
      />
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold capitalize border-b pb-2">
            {category.replace(/_/g, " ")}
          </h2>
          <div className="space-y-4">
            {items.map((setting) => (
              <div key={setting.key} className="grid gap-1.5">
                <Label htmlFor={setting.key} className="font-mono text-sm">
                  {setting.key}
                </Label>
                {setting.description && (
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                )}
                <div id={setting.key}>{renderInput(setting)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Allowed Domains */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold capitalize border-b pb-2">Allowed Domains</h2>
        <div className="flex flex-wrap gap-2">
          {domains.map((d) => (
            <Badge
              key={d.domain}
              variant={d.isActive ? "default" : "secondary"}
              className="cursor-pointer gap-1"
              onClick={() => toggleDomain(d.domain)}
            >
              {d.domain}
              <X className="size-3" />
            </Badge>
          ))}
          {domains.length === 0 && (
            <p className="text-sm text-muted-foreground">No domains configured.</p>
          )}
        </div>
        <div className="flex gap-2 max-w-sm">
          <Input
            placeholder="e.g. spmvv.ac.in"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
          />
          <Button variant="outline" onClick={addDomain} type="button">
            <Plus className="size-4 mr-1" />
            Add Domain
          </Button>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving…" : "Save All Settings"}
      </Button>
    </div>
  );
}
