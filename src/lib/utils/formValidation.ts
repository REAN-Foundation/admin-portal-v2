import { z, ZodSchema } from 'zod';

export const validateFormData = async <T extends ZodSchema>(
  request: Request, 
  schema: T
) => {
  const data = await request.formData();
  const formData = Object.fromEntries(
    Array.from(data.entries()).map(([key, value]) => [key, typeof value === 'string' ? value : ''])
  );
  try {
    const result = schema.parse(formData);
    return { result, errors: null };
  } catch (err: any) {
    const { fieldErrors: errors } = err.flatten();
    return { result: formData, errors };
  }
};