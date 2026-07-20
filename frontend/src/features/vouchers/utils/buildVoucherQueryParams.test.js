import { describe, expect, it } from "vitest";
import { buildVoucherQueryParams } from "./buildVoucherQueryParams";

describe("buildVoucherQueryParams", () => {
  const categories = [{ id: "cat-food", slug: "am-thuc" }];

  it("maps all customer catalog filters to the API contract", () => {
    expect(buildVoucherQueryParams({
      keyword: "  buffet ",
      category: "am-thuc",
      city: "Hồ Chí Minh",
      partner: "Haidilao",
      minPrice: "100000",
      maxPrice: "500000",
      minDiscount: "25",
      sort: "price-asc",
      page: 2,
      limit: 8,
      categories,
    })).toEqual({
      keyword: "buffet",
      categoryId: "cat-food",
      city: "Hồ Chí Minh",
      partner: "Haidilao",
      minPrice: 100000,
      maxPrice: 500000,
      minDiscount: 25,
      sort: "price_asc",
      page: 2,
      limit: 8,
    });
  });

  it("omits empty optional filters and bounds discount", () => {
    const params = buildVoucherQueryParams({
      category: "all",
      city: "",
      partner: "",
      minPrice: "",
      maxPrice: "",
      minDiscount: "150",
      sort: "popular",
      categories,
    });

    expect(params).toMatchObject({ page: 1, limit: 8, sort: "popularity", minDiscount: 100 });
    expect(params).not.toHaveProperty("city");
    expect(params).not.toHaveProperty("minPrice");
  });
});
