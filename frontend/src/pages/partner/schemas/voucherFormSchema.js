import { z } from "zod";

const voucherCategories = ["am-thuc", "lam-dep", "du-lich", "mua-sam", "giai-tri"];

const normalizeOptionalText = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const voucherFormSchema = z
  .object({
    name: z
      .string({
        required_error: "Vui lòng nhập tên voucher",
        invalid_type_error: "Vui lòng nhập tên voucher",
      })
      .trim()
      .min(5, "Tên voucher phải có ít nhất 5 ký tự"),

    category: z.enum(voucherCategories, {
      errorMap: () => ({ message: "Vui lòng chọn danh mục hợp lệ" }),
    }),

    // Empty string is treated as "Nhiều chi nhánh" in the service layer.
    location: z.preprocess(normalizeOptionalText, z.string().optional()),

    // Allow empty string (no image). If user types something, it must be a valid URL.
    imageUrl: z.preprocess(
      normalizeOptionalText,
      z
        .string()
        .url({ message: "URL hình ảnh không hợp lệ" })
        .optional()
    ),

    originalPrice: z.coerce
      .number({
        required_error: "Vui lòng nhập số hợp lệ",
        invalid_type_error: "Vui lòng nhập số hợp lệ",
      })
      .min(0, "Giá gốc không được âm"),

    salePrice: z.coerce
      .number({
        required_error: "Vui lòng nhập số hợp lệ",
        invalid_type_error: "Vui lòng nhập số hợp lệ",
      })
      .min(0, "Giá bán không được âm"),

    totalQuantity: z.coerce
      .number({
        required_error: "Vui lòng nhập số hợp lệ",
        invalid_type_error: "Vui lòng nhập số hợp lệ",
      })
      .int("Số lượng phải là số nguyên")
      .min(1, "Số lượng phải lớn hơn 0"),

    startDate: z.string().trim().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().trim().min(1, "Vui lòng chọn ngày kết thúc"),
  })
  .superRefine((data, ctx) => {
    if (data.originalPrice > 0 && data.salePrice >= data.originalPrice) {
      ctx.addIssue({
        code: "custom",
        message: "Giá bán phải nhỏ hơn giá gốc",
        path: ["salePrice"],
      });
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (Number.isNaN(start.getTime())) {
        ctx.addIssue({
          code: "custom",
          message: "Ngày bắt đầu không hợp lệ",
          path: ["startDate"],
        });
      }

      if (Number.isNaN(end.getTime())) {
        ctx.addIssue({
          code: "custom",
          message: "Ngày kết thúc không hợp lệ",
          path: ["endDate"],
        });
      }

      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        ctx.addIssue({
          code: "custom",
          message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
          path: ["endDate"],
        });
      }
    }
  });
