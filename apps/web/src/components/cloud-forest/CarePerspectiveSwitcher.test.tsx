import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { carePerspectiveOptions } from "@/data/careLifecycleMockData";

import { CarePerspectiveSwitcher } from "./CarePerspectiveSwitcher";

describe("CarePerspectiveSwitcher", () => {
  it("clearly switches among fictional review perspectives", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CarePerspectiveSwitcher
        onChange={onChange}
        options={carePerspectiveOptions}
        viewerId="you"
      />,
    );

    expect(screen.getByText(/not account switching/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Reviewing as"), "anya");
    expect(onChange).toHaveBeenCalledWith("anya");
  });
});
