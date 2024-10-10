import { ky } from "./ky";

const instance = ky.create({
  prefixUrl: "http://localhost:3000",
  headers: {},
});

export const httpInstance = {
  get: instance.get,
  post: instance.post,
  put: instance.put,
  patch: instance.patch,
  delete: instance.delete,
};
