import { describe, it, expect, beforeEach } from "vitest";
import { apiClient, setAccessToken } from "@/lib/api-client";
import { jsonRes, badRes, mockFetch } from "@/test/http";

const API = "http://api.test/api";

describe("api-client", () => {
  let fetchMock: ReturnType<typeof mockFetch>;
  beforeEach(() => {
    fetchMock = mockFetch();
    setAccessToken(null);
  });

  it("GET unwraps {ok,data} and hits /api<path> with credentials, no body", async () => {
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: { hi: 1 } }));
    const data = await apiClient.get<{ hi: number }>("/thing");
    expect(data).toEqual({ hi: 1 });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/thing`);
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("include");
    expect(init.body).toBeUndefined();
  });

  it("POST sends a JSON body + Content-Type", async () => {
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: { id: "x" } }));
    await apiClient.post("/thing", { a: 1 });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/thing`);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("attaches the in-memory Bearer token when set", async () => {
    setAccessToken("tok123");
    fetchMock.mockResolvedValueOnce(jsonRes(200, { ok: true, data: {} }));
    await apiClient.get("/thing");
    expect(fetchMock.mock.calls[0]![1].headers["Authorization"]).toBe("Bearer tok123");
  });

  it("throws a typed ApiError carrying code + status on {ok:false}", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonRes(422, { ok: false, error: { code: "VALIDATION_ERROR", message: "email is required" } }),
    );
    await expect(apiClient.post("/thing", {})).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      code: "VALIDATION_ERROR",
      message: "email is required",
    });
  });

  it("throws INTERNAL ApiError on a malformed (non-JSON) response", async () => {
    fetchMock.mockResolvedValueOnce(badRes(500));
    await expect(apiClient.get("/thing")).rejects.toMatchObject({ code: "INTERNAL", status: 500 });
  });

  it("on 401 refreshes once and retries with the fresh token", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonRes(401, { ok: false, error: { code: "INVALID_TOKEN", message: "expired" } }))
      .mockResolvedValueOnce(jsonRes(200, { ok: true, data: { accessToken: "fresh" } })) // /auth/refresh
      .mockResolvedValueOnce(jsonRes(200, { ok: true, data: { ok: 1 } })); // retried request
    const data = await apiClient.get<{ ok: number }>("/protected");
    expect(data).toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]![0]).toBe(`${API}/auth/refresh`);
    expect(fetchMock.mock.calls[2]![1].headers["Authorization"]).toBe("Bearer fresh");
  });

  it("does NOT refresh when skipAuthRefresh is set", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonRes(401, { ok: false, error: { code: "UNAUTHENTICATED", message: "bad creds" } }),
    );
    await expect(apiClient.post("/auth/login", {}, { skipAuthRefresh: true })).rejects.toMatchObject({
      status: 401,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces the original 401 when refresh itself fails (no retry)", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonRes(401, { ok: false, error: { code: "INVALID_TOKEN", message: "expired" } }))
      .mockResolvedValueOnce(jsonRes(401, { ok: false, error: { code: "INVALID_TOKEN", message: "no cookie" } }));
    await expect(apiClient.get("/protected")).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
