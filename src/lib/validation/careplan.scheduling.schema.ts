import { z } from 'zod';

export const createOrUpdatSchedulingeSchema = z.object({
	AssetType: z
		.string({
			required_error: 'AssetType is required.',
			invalid_type_error: 'AssetType must be a string.'
		})
		.min(1, { message: 'AssetType cannot be empty.' })
		.max(256, { message: 'AssetType must be at most 256 characters long.' }),
	AssetId: z
		.string({
			required_error: 'AssetId is required.',
			invalid_type_error: 'AssetId must be a string.'
		}),
	ScheduleDay: z.number({
		required_error: 'Schedule day is required.',
		invalid_type_error: 'Schedule day must be a number.'
	}),
	TimeSlot: z.string(
		{
			required_error: 'TimeSlot is required.',
			invalid_type_error: 'TimeSlot must be a string.'
		})

});


