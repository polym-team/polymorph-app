'use client';

import { useState, useEffect } from 'react';

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
  onEditingChange: (editing: boolean) => void;
  onValidChange: (valid: boolean) => void;
}

function validateNumbers(numbers: string | null): { valid: boolean; error: string | null } {
  if (!numbers || numbers.trim() === '') return { valid: false, error: '번호를 입력해주세요' };

  const parts = numbers.split(',').map((s) => s.trim());
  if (parts.length !== 6) return { valid: false, error: '6개의 번호를 입력해주세요' };

  const nums: number[] = [];
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return { valid: false, error: `"${p}"는 숫자가 아닙니다` };
    const n = parseInt(p, 10);
    if (n < 1 || n > 45) return { valid: false, error: `${n}은(는) 1~45 범위를 벗어납니다` };
    if (nums.includes(n)) return { valid: false, error: `${n}이(가) 중복됩니다` };
    nums.push(n);
  }

  return { valid: true, error: null };
}

function areAllPresetsValid(presets: { mode: string; numbers: string | null }[]): boolean {
  return presets.every((p) => {
    if (p.mode === 'auto') return true;
    return validateNumbers(p.numbers).valid;
  });
}

export function PresetEditor({ accountId, presets, onUpdate, onEditingChange, onValidChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [localPresets, setLocalPresets] = useState(presets);
  const [saving, setSaving] = useState(false);

  // 프리셋이 외부에서 바뀌면 로컬도 동기화
  useEffect(() => {
    setLocalPresets(presets);
  }, [presets]);

  // 편집 상태 변경 알림
  useEffect(() => {
    onEditingChange(editing);
  }, [editing, onEditingChange]);

  // 유효성 상태 알림 (비편집 모드에서도)
  useEffect(() => {
    onValidChange(areAllPresetsValid(localPresets));
  }, [localPresets, onValidChange]);

  function startEditing() {
    setLocalPresets(presets);
    setEditing(true);
  }

  function cancelEditing() {
    setLocalPresets(presets);
    setEditing(false);
  }

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
    if (!areAllPresetsValid(localPresets)) return;
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
            onClick={startEditing}
            className="text-xs text-lotto-600 hover:underline"
          >
            수정
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={cancelEditing}
              className="text-xs text-gray-400 hover:underline"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !areAllPresetsValid(localPresets)}
              className="text-xs font-medium text-lotto-600 hover:underline disabled:text-gray-300 disabled:no-underline"
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

          const validation =
            editing && preset.mode === 'manual'
              ? validateNumbers(preset.numbers)
              : null;

          return (
            <div key={slot}>
              <div
                className={`flex items-center gap-2 rounded border bg-white px-3 py-2 ${
                  validation && !validation.valid ? 'border-red-300' : ''
                }`}
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
                        className={`flex-1 rounded border px-2 py-1 text-sm ${
                          validation && !validation.valid ? 'border-red-300' : ''
                        }`}
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
              {validation && !validation.valid && (
                <p className="mt-0.5 pl-8 text-xs text-red-500">{validation.error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
