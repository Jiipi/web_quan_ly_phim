import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmProvider, useConfirm } from "./confirm-dialog";

function Harness({ onResult }: { onResult: (result: boolean) => void }) {
  const { confirm } = useConfirm();
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await confirm({
          title: "Xóa phim?",
          message: "Hành động không thể hoàn tác.",
          danger: true,
        });
        onResult(ok);
      }}
    >
      trigger
    </button>
  );
}

function setup() {
  const results: boolean[] = [];
  render(
    <ConfirmProvider>
      <Harness onResult={(r) => results.push(r)} />
    </ConfirmProvider>,
  );
  return results;
}

describe("ConfirmDialog", () => {
  it("mở dialog với tiêu đề + nội dung", async () => {
    setup();
    await userEvent.click(screen.getByText("trigger"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Xóa phim?")).toBeInTheDocument();
    expect(screen.getByText("Hành động không thể hoàn tác.")).toBeInTheDocument();
  });

  it("resolve true khi bấm Xác nhận", async () => {
    const results = setup();
    await userEvent.click(screen.getByText("trigger"));
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
    await waitFor(() => expect(results).toEqual([true]));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resolve false khi bấm Hủy", async () => {
    const results = setup();
    await userEvent.click(screen.getByText("trigger"));
    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    await waitFor(() => expect(results).toEqual([false]));
  });

  it("resolve false khi nhấn Escape", async () => {
    const results = setup();
    await userEvent.click(screen.getByText("trigger"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(results).toEqual([false]));
  });
});
