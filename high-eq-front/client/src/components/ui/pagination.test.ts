import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("pagination component", () => {
  it("uses a third-party pagination implementation", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/ui/pagination.tsx"),
      "utf8"
    );

    expect(source).toContain("react-paginate");
  });

  it("keeps ellipsis visible instead of clipping or dropping page items", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/ui/pagination.tsx"),
      "utf8"
    );

    expect(source).not.toContain("dropEllipsisThenNav");
    expect(source).not.toContain("react-responsive-pagination");
    expect(source).not.toContain("overflow-hidden");
  });
});
