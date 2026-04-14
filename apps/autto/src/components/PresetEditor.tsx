'use client';

import { useState } from 'react';

interface Preset {
  id: number;
  slot: string;
  mode: string;
  numbers: string | null;
}

interface Props {
  accountId: number;
  presets: Preset[];
  onUpdate: () => void;
}

export function PresetEditor({ accountId, presets, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [localPresets, setLocalPresets] = useState(presets);
  const [saving, setSaving] = useState(false);

  function handleModeChange(slot: string, mode: string) {
    setLocalPresets((prev) =>
      prev.map((p) =>
        p.slot === slot
          ? { ...p, mode, numbers: mode === 'auto' ? null : p.numbers }
          : p,
      ),
    );
  }

  function handleNumbersChange(slot: string, numbers: string) {
    setLocalPresets((prev) =>
      prev.map((p) => (p.slot === slot ? { ...p, numbers } : p)),
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          presets: localPresets.map((p) => ({
            slot: p.slot,
            mode: p.mode,
            numbers: p.mode === 'auto' ? null : p.numbers,
          })),
        }),
      });
      setEditing(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  }

  const slots = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">번호 설정 (5세트)</h3>
        {!editing ? (
          <button
            onClick={() => { setLocalPresets(presets); setEditing(true); }}
            className="text-xs text-lotto-600 hover:underline"
          >
            수정
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setLocalPresets(presets); setEditing(false); }}
              className="text-xs text-gray-400 hover:underline"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs font-medium text-lotto-600 hover:underline"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {slots.map((slot) => {
          const preset = localPresets.find((p) => p.slot === slot) || {
            id: 0,
            slot,
            mode: 'auto',
            numbers: null,
          };

          return (
            <div
              key={slot}
              className="flex items-center gap-2 rounded border bg-white px-3 py-2"
            >
              <span className="w-6 text-center text-sm font-bold text-lotto-500">
                {slot}
              </span>

              {editing ? (
                <>
                  <select
                    value={preset.mode}
                    onChange={(e) => handleModeChange(slot, e.target.value)}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    <option value="auto">자동</option>
                    <option value="manual">수동</option>
                  </select>
                  {preset.mode === 'manual' && (
                    <input
                      type="text"
                      value={preset.numbers ?? ''}
                      onChange={(e) => handleNumbersChange(slot, e.target.value)}
                      placeholder="1,2,3,4,5,6"
                      className="flex-1 rounded border px-2 py-1 text-sm"
                    />
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-600">
                  {preset.mode === 'auto' ? (
                    <span className="text-gray-400">자동 선택</span>
                  ) : (
                    preset.numbers || <span className="text-red-400">번호 미설정</span>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
