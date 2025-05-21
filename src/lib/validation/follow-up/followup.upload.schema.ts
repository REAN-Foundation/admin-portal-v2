import { z } from "zod";

///////////////////////////////////////////////////////////////////////////////

export const createOrUpdateSchema = z.object({
	file: z.instanceof(File, { message: "File is required." }),
});