"use client";

import { useState } from "react";
import { Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import type { JamOperasionalSetting, JamOperasionalSettingPayload } from "@/lib/jamOperasional";

type JamOperasionalSettingCardProps = {
  setting: JamOperasionalSetting;
  onSave: (payload: JamOperasionalSettingPayload) => Promise<void>;
};

export function JamOperasionalSettingCard({
  setting,
  onSave,
}: JamOperasionalSettingCardProps) {
  const [badgeText, setBadgeText] = useState(setting.badge_text);
  const [title, setTitle] = useState(setting.title);
  const [note, setNote] = useState(setting.note);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        badge_text: badgeText.trim(),
        title: title.trim(),
        note: note.trim(),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <Settings className="size-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-800">
          Pengaturan Header & Catatan Kaki Kartu
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="setting-title">Judul Kartu</FieldLabel>
            <Input
              id="setting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Jam Operasional"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="setting-badge">Teks Badge Status (Kanan Atas)</FieldLabel>
            <Input
              id="setting-badge"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Buka Hari Kerja"
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="setting-note">Catatan Kaki Berbintang (*)</FieldLabel>
          <Textarea
            id="setting-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="* Untuk mitra kontrak pemeliharaan gedung..."
          />
        </Field>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            size="sm"
            className="bg-[#0A2540] text-white hover:bg-[#071a2e]"
          >
            {saving ? (
              <>
                <Spinner className="mr-2 size-3.5" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="mr-1.5 size-3.5" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default JamOperasionalSettingCard;
