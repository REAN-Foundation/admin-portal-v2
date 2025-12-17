import { z } from 'zod';
import { NotificationChannel } from '$lib/types/notification.channel';

const whatsAppConfigSchema = z.object({
    TemplateName: z
        .string()
        .min(1, { message: 'TemplateName cannot be empty' })
        .max(256, { message: 'TemplateName must be at most 256 characters long.' })
        .optional(),
    TemplateLanguage: z
        .string()
        .max(64, { message: 'TemplateLanguage must be at most 64 characters long.' })
        .optional(),
    FlowToken: z
        .string()
        .max(512, { message: 'FlowToken must be at most 512 characters long.' })
        .optional(),
    FlowActionData: z
        .record(z.any())
        .optional()
});

const genericChannelConfigSchema = z.record(z.any());

const metaDataSchema = z.object({
    Type: z
        .string({
            required_error: 'Type is required.',
            invalid_type_error: 'Type must be a string.'
        })
        .min(1, { message: 'Type cannot be empty' })
        .max(128, { message: 'Type must be at most 128 characters long.' }),
    Channels: z.object({
        [NotificationChannel.WhatsApp]: whatsAppConfigSchema.optional(),
        [NotificationChannel.Telegram]: genericChannelConfigSchema.optional(),
        [NotificationChannel.Email]: genericChannelConfigSchema.optional(),
        [NotificationChannel.SMS]: genericChannelConfigSchema.optional(),
        [NotificationChannel.WebPush]: genericChannelConfigSchema.optional(),
        [NotificationChannel.MobilePush]: genericChannelConfigSchema.optional(),
        [NotificationChannel.Webhook]: genericChannelConfigSchema.optional(),
        [NotificationChannel.Slack]: genericChannelConfigSchema.optional(),
        [NotificationChannel.WhatsappWati]: genericChannelConfigSchema.optional(),
        [NotificationChannel.WhatsappMeta]: genericChannelConfigSchema.optional()
    })
    .optional()
});

export const createOrUpdateSchema = z.object({
    Name: z
        .string({
            required_error: 'Name is required.',
            invalid_type_error: 'Name must be a string.'
        })
        .min(1, { message: 'Name cannot be empty' })
        .max(256, { message: 'Name must be at most 256 characters long.' }),
    Description: z
        .string()
        .max(1024, { message: 'Description must be at most 1024 characters long.' })
        .optional(),

    Template: z.string()
        .max(1024, { message: 'Template Type must be at most 1024 characters long.' })
        .optional(),

    ReferenceTemplateCode: z.string()
    .max(1024, { message: 'TemplateCode must be at most 1024 characters long.' })
    .optional()
    .or(z.literal('')),
    // ReferenceTemplateCode: z.string()
    //     .max(1024, { message: 'TemplateCode must be at most 1024 characters long.' })
    //     .optional(),
    Tags: z.array(z.string()).optional(),
    Version: z.string()
        .max(1024, { message: 'Version must be at most 1024 characters long.' })
        .optional(),
    TenantId: z
		.string({
			required_error: 'TenantId is required.',
			invalid_type_error: 'TenantId must be a string.'
		}),
    Metadata: metaDataSchema.optional()
});