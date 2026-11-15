import { describe, expect, test } from "bun:test";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  readLocaleCookie,
  writeLocaleCookie,
} from "./locale-cookie";

type FakeDocument = { cookie: string };

function withFakeDocument(initial: string, run: (writes: string[]) => void) {
  const writes: string[] = [];
  let jar = initial;
  const fake = {
    get cookie() {
      return jar;
    },
    set cookie(value: string) {
      writes.push(value);
      jar = value.split(";")[0] ?? "";
    },
  };

  const globals = globalThis as unknown as { document?: FakeDocument };
  const previous = globals.document;
  globals.document = fake as FakeDocument;
  try {
    run(writes);
  } finally {
    if (previous === undefined) delete globals.document;
    else globals.document = previous;
  }
}

describe("locale cookie", () => {
  test("returns null when no cookie is set", () => {
    withFakeDocument("", () => {
      expect(readLocaleCookie()).toBeNull();
    });
  });

  test("reads the locale among other cookies", () => {
    withFakeDocument(`other=1; ${LOCALE_COOKIE}=ar; another=2`, () => {
      expect(readLocaleCookie()).toBe("ar");
    });
  });

  test("decodes an encoded locale value", () => {
    withFakeDocument(`${LOCALE_COOKIE}=${encodeURIComponent("العربية")}`, () => {
      expect(readLocaleCookie()).toBe("العربية");
    });
  });

  test("writes a path-scoped, long-lived, same-site cookie", () => {
    withFakeDocument("", (writes) => {
      writeLocaleCookie("ar");
      expect(writes).toHaveLength(1);
      expect(writes[0]).toContain(`${LOCALE_COOKIE}=ar`);
      expect(writes[0]).toContain("path=/");
      expect(writes[0]).toContain(`max-age=${LOCALE_COOKIE_MAX_AGE}`);
      expect(writes[0]).toContain("SameSite=Lax");
    });
  });
});
