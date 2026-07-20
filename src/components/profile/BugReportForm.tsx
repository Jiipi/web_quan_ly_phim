"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  BUG_REPORT_ALLOWED_MIME,
  BUG_REPORT_CATEGORIES,
  BUG_REPORT_CATEGORY_LABELS,
  BUG_REPORT_MAX_FILES,
  BUG_REPORT_MAX_FILE_SIZE_BYTES,
  type BugReportCategory,
} from "@/lib/bug-report-schema";

interface FieldErrors {
  category?: string[];
  subject?: string[];
  description?: string[];
  attachments?: string[];
  form?: string[];
}

const MAX_BYTES_LABEL = `${BUG_REPORT_MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`;

export function BugReportForm() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [category, setCategory] = useState<BugReportCategory>("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const next = Array.from(e.target.files ?? []);
    const merged = [...files, ...next].slice(0, BUG_REPORT_MAX_FILES);
    setFiles(merged);
    setErrors((p) => ({ ...p, attachments: undefined }));
    // Reset input để chọn lại cùng file vẫn trigger onChange
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(idx: number) {
    setFiles((p) => p.filter((_, i) => i !== idx));
  }

  function validate(): FieldErrors {
    const out: FieldErrors = {};
    if (!subject.trim() || subject.trim().length < 3) {
      out.subject = ["Tiêu đề tối thiểu 3 ký tự"];
    } else if (subject.trim().length > 200) {
      out.subject = ["Tiêu đề tối đa 200 ký tự"];
    }
    if (!description.trim() || description.trim().length < 10) {
      out.description = ["Mô tả tối thiểu 10 ký tự"];
    } else if (description.trim().length > 4000) {
      out.description = ["Mô tả tối đa 4000 ký tự"];
    }
    if (files.length > BUG_REPORT_MAX_FILES) {
      out.attachments = [`Tối đa ${BUG_REPORT_MAX_FILES} ảnh`];
    }
    return out;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    const localErrors = validate();
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append(
        "metadata",
        JSON.stringify({
          category,
          subject: subject.trim(),
          description: description.trim(),
        }),
      );
      for (const f of files) fd.append("attachments", f);

      const res = await fetch("/api/profile/bug-report", {
        method: "POST",
        body: fd,
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
        emailSent?: boolean;
        emailError?: string;
      };

      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        toastError(data.error || "Gửi báo lỗi thất bại. Vui lòng thử lại.");
        return;
      }

      // Reset form khi thành công
      setSubject("");
      setDescription("");
      setFiles([]);
      setCategory("bug");

      if (data.emailSent) {
        toastSuccess("Đã gửi báo lỗi đến admin. Cảm ơn bạn!");
      } else {
        toastSuccess("Báo lỗi đã được lưu. Admin sẽ xem trong bảng quản trị (chưa gửi mail).");
      }
    } catch (err) {
      console.error("[BugReportForm] submit error:", err);
      toastError("Lỗi mạng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {errors.form?.map((m) => (
        <Alert key={m} kind="error" message={m} />
      ))}

      {/* Category */}
      <Field label="Loại lỗi" required error={errors.category?.[0]}>
        <Select value={category} onValueChange={(v) => setCategory(v as BugReportCategory)}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUG_REPORT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {BUG_REPORT_CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Subject */}
      <Field label="Tiêu đề" required hint={`${subject.length}/200`} error={errors.subject?.[0]}>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ví dụ: Không tìm thấy phim sau khi nhập"
          maxLength={200}
        />
      </Field>

      {/* Description */}
      <Field
        label="Mô tả chi tiết"
        required
        hint={`${description.length}/4000`}
        error={errors.description?.[0]}
      >
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả các bước tái hiện, kết quả mong đợi vs thực tế, trình duyệt/ thiết bị..."
          rows={6}
          maxLength={4000}
        />
      </Field>

      {/* Attachments */}
      <Field
        label="Ảnh đính kèm (tùy chọn)"
        hint={`${files.length}/${BUG_REPORT_MAX_FILES} • tối đa ${MAX_BYTES_LABEL}/file`}
        error={errors.attachments?.[0]}
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="attachments"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-bg/40 px-4 py-4 font-mono text-[11px] uppercase tracking-widest text-text-secondary transition-all hover:border-primary/60 hover:bg-bg/60 hover:text-primary"
          >
            <ImagePlus size={16} />
            Chọn ảnh (jpg, png, webp, gif)
          </label>
          <input
            ref={inputRef}
            id="attachments"
            type="file"
            accept={BUG_REPORT_ALLOWED_MIME.join(",")}
            multiple
            onChange={handleFiles}
            className="sr-only"
          />
          {files.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface/60 px-3 py-2 font-mono text-[11px]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <CheckCircle2 size={12} className="shrink-0 text-completed" />
                    <span className="truncate text-text">{f.name}</span>
                    <span className="shrink-0 text-text-muted">({formatBytes(f.size)})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-text-muted transition-colors hover:text-dropped"
                    aria-label={`Xoá ${f.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>

      <Button type="submit" disabled={submitting} size="lg" className="w-full">
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Đang gửi…
          </>
        ) : (
          <>
            <Send size={14} />
            Gửi báo lỗi
          </>
        )}
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={label}
          className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary"
        >
          <span className="inline-block h-1 w-1 rounded-full bg-primary" />
          {label}
          {required && <span className="text-primary">*</span>}
        </label>
        {hint && <span className="font-mono text-[10px] text-text-muted">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-dropped">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

function Alert({ kind, message }: { kind: "success" | "error"; message: string }) {
  const styles =
    kind === "error"
      ? "border-dropped/40 bg-dropped/10 text-dropped"
      : "border-completed/40 bg-completed/10 text-completed";
  return (
    <div
      role="alert"
      className={`flex items-center gap-2 rounded-md border px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider ${styles}`}
    >
      {kind === "error" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
      {message}
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
