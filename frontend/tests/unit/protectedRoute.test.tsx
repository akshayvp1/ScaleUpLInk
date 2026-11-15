import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkStatus: vi.fn(),
  storeDispatch: vi.fn(),
}));

// The real store boots redux-persist at import time; the route only needs
// `dispatch`, so a lightweight stub keeps this test isolated and fast.
vi.mock("../../src/redux/app/store", () => ({
  store: { dispatch: mocks.storeDispatch },
}));

vi.mock("../../src/services/shared/sharedService", () => ({
  default: { checkStatus: mocks.checkStatus },
}));

import ProtectedRoute from "../../src/routes/protectedRoute";
import {
  persistedAuthReducer,
  signIn,
} from "../../src/redux/features/auth/authSlice";
import { UserRole } from "../../src/types/auth/auth.types";

type Role = "entrepreneur" | "investor" | "admin";

const renderWithRole = (userRole: UserRole, allowedRoles: Role[]) => {
  const store = configureStore({ reducer: { auth: persistedAuthReducer } });

  store.dispatch(
    signIn({
      email: "admin@example.com",
      role: userRole,
      token: "token",
      user: { email: "admin@example.com", role: userRole, token: "token" },
    })
  );

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/dashboard/admin-dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route
              path="/dashboard/admin-dashboard"
              element={<div>admin dashboard</div>}
            />
          </Route>
          <Route path="/signin" element={<div>user signin</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("ProtectedRoute admin access", () => {
  beforeEach(() => {
    mocks.checkStatus.mockReset();
    mocks.storeDispatch.mockReset();
    mocks.checkStatus.mockResolvedValue({ success: true });
  });

  it("renders the admin dashboard for an authenticated admin", async () => {
    renderWithRole(UserRole.ADMIN, ["admin"]);

    expect(await screen.findByText("admin dashboard")).toBeInTheDocument();
    expect(screen.queryByText("user signin")).not.toBeInTheDocument();
  });

  it("redirects a non-admin to the normal signin page", async () => {
    renderWithRole(UserRole.ENTREPRENEUR, ["admin"]);

    expect(await screen.findByText("user signin")).toBeInTheDocument();
    expect(screen.queryByText("admin dashboard")).not.toBeInTheDocument();
  });

  it("redirects to signin when the account status check fails", async () => {
    mocks.checkStatus.mockResolvedValue({ success: false });

    renderWithRole(UserRole.ADMIN, ["admin"]);

    expect(await screen.findByText("user signin")).toBeInTheDocument();
    expect(mocks.storeDispatch).toHaveBeenCalled();
  });
});
