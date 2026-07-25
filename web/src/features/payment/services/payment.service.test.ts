import { describe, it, expect, beforeEach } from "vitest";
import { paymentService } from "@/features/payment/services/payment.service";
import { setAccessToken } from "@/lib/api-client";
import { jsonRes, mockFetch } from "@/test/http";

const API = "http://api.test/api";

describe("paymentService (docs/04 §8)", () => {
  let fetchMock: ReturnType<typeof mockFetch>;
  beforeEach(() => {
    fetchMock = mockFetch();
    setAccessToken(null);
  });

  it("createOrder → POST /payment/order {courseId}, returns the server-priced order", async () => {
    const order = { orderId: "order_X", amount: 49900, currency: "INR", razorpayKeyId: "rzp_live_x" };
    fetchMock.mockResolvedValueOnce(jsonRes(201, { ok: true, data: order }));
    const res = await paymentService.createOrder("rag-systems");
    expect(res).toEqual(order);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API}/payment/order`);
    expect(init.method).toBe("POST");
    // the client never sends a price — only the courseId (amount is server-resolved)
    expect(JSON.parse(init.body)).toEqual({ courseId: "rag-systems" });
  });
});
