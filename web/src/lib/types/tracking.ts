export type ConsentFlag = { analytics: boolean; marketing: boolean };

export type TrackItem = {
  ref: string;
  name?: string;
  price?: number;
  qty?: number;
};

export type TrackPayload = {
  event?: string;
  consent?: ConsentFlag;
  transactionId?: string;
  value?: number;
  currency?: string;
  items?: TrackItem[];
  eventId?: string;
  sourceUrl?: string;
  clientId?: string;
  fbp?: string;
  fbc?: string;
  email?: string;
  phone?: string;
};

export type LegResult = "sent" | "skipped" | "refused" | "error";
