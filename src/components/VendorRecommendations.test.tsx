import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { VendorRecommendations } from "./VendorRecommendations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { response: "Test" }, error: null }),
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

describe("VendorRecommendations", () => {
  it("renders recommendation form", () => {
    renderWithProviders(<VendorRecommendations />);
    expect(screen.getByText("Рекомендации поставщиков")).toBeInTheDocument();
  });

  it("renders wedding style input", () => {
    renderWithProviders(<VendorRecommendations />);
    expect(screen.getByLabelText("Стиль свадьбы")).toBeInTheDocument();
  });

  it("renders budget input", () => {
    renderWithProviders(<VendorRecommendations />);
    expect(screen.getByLabelText("Бюджет ($)")).toBeInTheDocument();
  });

  it("renders priorities textarea", () => {
    renderWithProviders(<VendorRecommendations />);
    expect(screen.getByLabelText("Что для вас самое важное?")).toBeInTheDocument();
  });

  it("renders get recommendations button", () => {
    renderWithProviders(<VendorRecommendations />);
    expect(screen.getByText("Получить рекомендации")).toBeInTheDocument();
  });

  it("allows input in form fields", () => {
    renderWithProviders(<VendorRecommendations />);
    
    const styleInput = screen.getByLabelText("Стиль свадьбы");
    fireEvent.change(styleInput, { target: { value: "Классический" } });
    expect(styleInput).toHaveValue("Классический");
    
    const budgetInput = screen.getByLabelText("Бюджет ($)");
    fireEvent.change(budgetInput, { target: { value: "15000" } });
    expect(budgetInput).toHaveValue(15000);
  });
});
