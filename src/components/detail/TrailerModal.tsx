"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TrailerModalProps {
  /** YouTube video key (the `v` in `youtube.com/watch?v=...`). */
  youtubeKey?: string | null;
  title?: string;
  triggerLabel?: string;
}

export function TrailerModal({
  youtubeKey,
  title = "Trailer",
  triggerLabel = "Xem trailer",
}: TrailerModalProps) {
  const [open, setOpen] = useState(false);
  if (!youtubeKey) return null;

  return (
    <>
      <Button variant="glass" onClick={() => setOpen(true)}>
        <Play size={14} />
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Trình phát trailer YouTube nhúng
          </DialogDescription>
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
