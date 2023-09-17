
const {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  test,
  expect,
} = require("jest");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../service/schemas/users");
require("dotenv").config();
const { DB_HOST } = process.env;

describe("test user registration & login", () => {
  let server;
  let response;

  beforeAll(async () => {
    await mongoose.connect(DB_HOST, { dbName: "db-contacts" });
    server = app.listen(3000);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    server.close();
  });

  describe("register user", () => {
    beforeEach(async () => {
      response = await request(app).post("/api/users/signup").send({
        email: "dorota@example.com",
        password: "examplepassword",
      });
    });

    afterEach(async () => {
      await User.findOneAndRemove({ email: "dorota@example.com" });
    });

    test("should respond with a 201 status code", () =>
      expect(response.statusCode).toBe(201));

    test("should return user", async () => {
      const getUser = await User.findOne({ email: "dorota@example.com" });
      const { email, subscription } = getUser;
      const user = {
        email,
        subscription,
      };

      expect(user).toMatchObject({
        email: "dorota@example.com",
        subscription: "starter",
      });
    });
  });

  describe("login user", () => {
    beforeEach(async () => {
      response = await request(app).post("/api/users/login").send({
        email: "dorota@example.com",
        password: "examplepassword",
      });
    });

    test("should respond with a 200 status code", () =>
      expect(response.statusCode).toBe(200));

    test("should return user", async () => {
      const getUser = await User.findOne({ email: "dorota@example.com" });
      const { email, subscription } = getUser;
      const user = {
        email,
        subscription,
      };

      expect(user).toMatchObject({
        email: "dorota@example.com",
        subscription: "starter",
      });
    });

    test("should return token token", async () => {
      const getUser = await User.findOne({ email: "dorota@example.com" });
      const { token } = getUser;
      expect(token).toBeTruthy();
    });
  });
});
