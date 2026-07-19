import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("tính đúng phần trăm và hiển thị số tập", () => {
    render(<ProgressBar current={5} total={10} />);
    expect(screen.getByText("Tập 5/10")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("trả 0% khi total = 0 (tránh chia cho 0) và ẩn phần trăm", () => {
    // Khi không biết tổng tập, thanh hiển thị trống và KHÔNG kèm "%" để
    // khớp với grid view / list view (tránh "Tập 0/0" gây hiểu nhầm).
    render(<ProgressBar current={0} total={0} />);
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getByText("Tập 0")).toBeInTheDocument();
  });

  it("kẹp phần trăm tối đa ở 100% khi current > total", () => {
    render(<ProgressBar current={15} total={10} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("làm tròn phần trăm", () => {
    render(<ProgressBar current={1} total={3} />);
    // 33.33 -> 33
    expect(screen.getByText("33%")).toBeInTheDocument();
  });

  it("ẩn phần chữ khi showText=false", () => {
    render(<ProgressBar current={5} total={10} showText={false} />);
    expect(screen.queryByText("Tập 5/10")).not.toBeInTheDocument();
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });
});
