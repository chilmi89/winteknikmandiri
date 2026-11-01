export type InquiryStatus = "pending" | "diproses" | "selesai" | "batal";

export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  service: string;
  address: string;
  notes: string;
  status: InquiryStatus | string;
  created_at: string;
  updated_at: string;
};

export type InquiriesResponse = {
  data: Inquiry[];
  total: number;
  limit: number;
};
