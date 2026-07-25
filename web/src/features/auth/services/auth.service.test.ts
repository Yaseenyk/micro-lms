import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/features/auth/services/auth.service";
import { setAccessToken } from "@/lib/api-client";
import { jsonRes, mockFetch } from "@/test/http";

const API = "http://api.test/api";

describe("authService (docs/04 §2-5)", () => {
  let fetchMock: ReturnType<typeof mockFetch>;
  beforeEach(() => {
    fetchMock = mockFetch();
    setAccessToken(null);
  });

  it("register → POST /auth/register with the input, returns {user,accessToken}", async () => {
    const payload = {
      user: { id: "u1", email: "a@b.com", name: "Asha", role: "student" },
      accessToken: "t",
    };
    fetchMock.mockResolvedValueOnce(jsonRes(201, { ok: true, data: payload }));
    const res = await authService.register({ email: "a@b.com", password: "password12", name: "Asha" });
    expect(res).toEqual(payload);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/auth/register`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ email: "a@b.com", password: "password12", name: "Asha" });
  });

  it("login → POST /auth/login", async () => {
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: { user: {}, accessToken: "t" } }));
    await authService.login({ email: "a@b.com", password: "x" });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/auth/login`);
    expect(JSON.parse(init.body)).toEqual({ email: "a@b.com", password: "x" });
  });

  it("logout → POST /auth/logout with no body", async () => {
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: { loggedOut: true } }));
    expect(await authService.logout()).toEqual({ loggedOut: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/auth/logout`);
    expect(init.body).toBeUndefined();
  });

  it("refresh → POST /auth/refresh and never triggers auto-refresh on its own 401", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonRes(401, { ok: false, error: { code: "INVALID_TOKEN", message: "no cookie" } }),
    );
    await expect(authService.refresh()).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1); // skipAuthRefresh — no recursion
    expect(fetchMock.mock.calls[0]![0]).toBe(`${API}/auth/refresh`);
  });
});
