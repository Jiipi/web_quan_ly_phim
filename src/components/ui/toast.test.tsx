import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock sonner before importing ToastProvider.
const successMock = vi.fn();
const errorMock = vi.fn();
const infoMock = vi.fn();

vi.mock("sonner", () => {
  const toastFn = Object.assign(vi.fn(), {
    success: (...args: unknown[]) => successMock(...args),
    error: (...args: unknown[]) => errorMock(...args),
    info: (...args: unknown[]) => infoMock(...args),
  });
  return {
    toast: toastFn,
    Toaster: () => null,
  };
});

import { ToastProvider, useToast } from "./toast";

function Harness({ variant = "success" }: { variant?: "success" | "error" | "info" }) {
  const { success, error, info, toast } = useToast();
  return (
    <>
      <button type="button" onClick={() => success("Đã lưu")}>
        success
      </button>
      <button type="button" onClick={() => error("Có lỗi")}>
        error
      </button>
      <button type="button" onClick={() => info("Lưu ý")}>
        info
      </button>
      <button type="button" onClick={() => toast("Thông báo", variant)}>
        toast
      </button>
    </>
  );
}

describe("Toast (sonner bridge)", () => {
  beforeEach(() => {
    successMock.mockClear();
    errorMock.mockClear();
    infoMock.mockClear();
  });

  it("success() gọi sonner.success", async () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText("success"));
    expect(successMock).toHaveBeenCalledWith("Đã lưu");
  });

  it("error() gọi sonner.error", async () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText("error"));
    expect(errorMock).toHaveBeenCalledWith("Có lỗi");
  });

  it("info() gọi sonner toast mặc định", async () => {
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText("info"));
    expect(infoMock).toHaveBeenCalledWith("Lưu ý");
  });

  it("toast() với variant success gọi sonner.success", async () => {
    render(
      <ToastProvider>
        <Harness variant="success" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText("toast"));
    expect(successMock).toHaveBeenCalledWith("Thông báo");
  });

  it("useToast ném lỗi khi thiếu provider", () => {
    function Bad() {
      useToast();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(/ToastProvider/);
  });

  it("ToastProvider render được không lỗi", () => {
    expect(() =>
      render(
        <ToastProvider>
          <div />
        </ToastProvider>,
      ),
    ).not.toThrow();
  });
});
