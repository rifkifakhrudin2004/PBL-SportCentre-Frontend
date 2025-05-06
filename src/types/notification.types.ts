export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  linkId?: string;
  createdAt: string;
} 