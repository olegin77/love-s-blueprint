import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { GuestList } from "./GuestList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("GuestList", () => {
  it("renders guest list header", () => {
    renderWithProviders(<GuestList weddingPlanId="test-id" />);
    expect(screen.getByText("Список гостей")).toBeInTheDocument();
  });

  it("renders add guest button", () => {
    renderWithProviders(<GuestList weddingPlanId="test-id" />);
    expect(screen.getByText("Добавить гостя")).toBeInTheDocument();
  });

  it("renders stats cards", () => {
    renderWithProviders(<GuestList weddingPlanId="test-id" />);
    expect(screen.getByText("Всего гостей")).toBeInTheDocument();
    expect(screen.getByText("Подтверждено")).toBeInTheDocument();
    expect(screen.getByText("Ожидают")).toBeInTheDocument();
  });
});
