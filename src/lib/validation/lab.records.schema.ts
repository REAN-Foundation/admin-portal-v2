import { z } from "zod";
import { zfd } from "zod-form-data";

export const updateLabRecordSchema = zfd.formData({
    typeName: z.string().max(128),
    displayName: z.string().optional(),
    snowmedCode: z.string().optional(),
    loincCode: z.string().optional(),
    normalRangeMin: zfd.numeric(z.number().optional()),
    normalRangeMax: zfd.numeric(z.number().optional()),
    unit: z.string().optional()
});
