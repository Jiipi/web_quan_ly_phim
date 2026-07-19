import { describe, it, expect, beforeAll } from "vitest";
import { authorizeCredentials, type CredentialUserRecord } from "./auth-credentials";
import { hashPassword } from "./password";

const EMAIL = "user@phimflow.com";
const PASSWORD = "Password123!";
let userRecord: CredentialUserRecord;

beforeAll(async () => {
  userRecord = {
    id: "u1",
    name: "Test",
    email: EMAIL,
    image: null,
    passwordHash: await hashPassword(PASSWORD),
    role: "user",
  };
});

const findUser = (email: string) => Promise.resolve(email === EMAIL ? userRecord : null);

describe("authorizeCredentials", () => {
  it("trả user khi email + mật khẩu đúng", async () => {
    const res = await authorizeCredentials({ email: EMAIL, password: PASSWORD }, findUser);
    expect(res).not.toBeNull();
    expect(res?.id).toBe("u1");
    expect(res?.email).toBe(EMAIL);
  });

  it("chuẩn hoá email (hoa/thường + khoảng trắng thừa)", async () => {
    const res = await authorizeCredentials(
      { email: "  USER@PhimFlow.com ", password: PASSWORD },
      findUser,
    );
    expect(res?.id).toBe("u1");
  });

  it("null khi mật khẩu sai", async () => {
    expect(await authorizeCredentials({ email: EMAIL, password: "wrong" }, findUser)).toBeNull();
  });

  it("đóng backdoor cũ: 'password123' bị từ chối", async () => {
    expect(
      await authorizeCredentials({ email: EMAIL, password: "password123" }, findUser),
    ).toBeNull();
  });

  it("null khi thiếu email hoặc mật khẩu", async () => {
    expect(await authorizeCredentials({ password: PASSWORD }, findUser)).toBeNull();
    expect(await authorizeCredentials({ email: EMAIL }, findUser)).toBeNull();
    expect(await authorizeCredentials(undefined, findUser)).toBeNull();
  });

  it("null khi không tìm thấy user", async () => {
    expect(
      await authorizeCredentials({ email: "nope@x.com", password: PASSWORD }, findUser),
    ).toBeNull();
  });

  it("null khi user chưa có passwordHash (vd chỉ dùng OAuth)", async () => {
    const noPwUser: CredentialUserRecord = { ...userRecord, passwordHash: null };
    const find = () => Promise.resolve(noPwUser);
    expect(await authorizeCredentials({ email: EMAIL, password: PASSWORD }, find)).toBeNull();
  });
});
