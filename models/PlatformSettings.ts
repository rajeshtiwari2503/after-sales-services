import mongoose, { Schema, Document, Model } from 'mongoose';

export interface PlatformSettingsDocument extends Document {
  tenantId: string;
  platformName: string;
  supportEmail: string;
  maxTicketsPerDay: number;
  slaResponseHours: number;
  slaResolutionHours: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  autoAssign: boolean;
  requirePhotos: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_PLATFORM_SETTINGS = {
  platformName: 'SaaS Techify',
  supportEmail: 'support@saastechify.com',
  maxTicketsPerDay: 100,
  slaResponseHours: 4,
  slaResolutionHours: 24,
  emailNotifications: true,
  smsNotifications: false,
  maintenanceMode: false,
  autoAssign: true,
  requirePhotos: false,
};

const PlatformSettingsSchema = new Schema<PlatformSettingsDocument>(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    platformName: { type: String, default: DEFAULT_PLATFORM_SETTINGS.platformName },
    supportEmail: { type: String, default: DEFAULT_PLATFORM_SETTINGS.supportEmail },
    maxTicketsPerDay: { type: Number, default: DEFAULT_PLATFORM_SETTINGS.maxTicketsPerDay },
    slaResponseHours: { type: Number, default: DEFAULT_PLATFORM_SETTINGS.slaResponseHours },
    slaResolutionHours: { type: Number, default: DEFAULT_PLATFORM_SETTINGS.slaResolutionHours },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    maintenanceMode: { type: Boolean, default: false },
    autoAssign: { type: Boolean, default: true },
    requirePhotos: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const PlatformSettings: Model<PlatformSettingsDocument> =
  mongoose.models.PlatformSettings ||
  mongoose.model<PlatformSettingsDocument>('PlatformSettings', PlatformSettingsSchema);

export default PlatformSettings;
