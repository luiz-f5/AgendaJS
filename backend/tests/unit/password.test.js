const { hashPassword } = require("../../src/utils/password");
const bcrypt = require("bcrypt");

test("hashPassword gera hash valido", async () => {
  const hash = await hashPassword("123456");
  expect(await bcrypt.compare("123456", hash)).toBe(true);
});
