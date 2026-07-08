export type UploadState = {
  ok: boolean;
  error?: string;
  message?: string;
  version?: number;
};

export type SiteSettings = Record<string, string>;

export type SaveSettingsState = {
  ok: boolean;
  message?: string;
  error?: string;
};

export const SETTING_DEFAULTS: SiteSettings = {
  site_name: "TaiChinh.vn",
  site_url: "https://taichinh.vn",
  site_description: "Nền tảng tài chính cá nhân Việt Nam",
  gold_api_endpoint: "https://giavang.now/en/api",
  redis_url: "redis://localhost:6379",
  adsense_publisher_id: "",
  enable_adsense: "true",
  enable_ad_banner: "true",
  enable_affiliate: "true",
  ai_auto_write: "true",
  ai_auto_summarize: "true",
  ai_auto_faq: "true",
  gsc_property_url: "https://taichinh.vn/",
  gsc_client_email: "",
};
