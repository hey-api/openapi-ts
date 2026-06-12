import { EMAIL_CTA_ID } from './constants';

type Announcement = {
  badge?: 'soon';
  link?: string;
  scrollTo?: string;
  text: string;
} | null;

export const announcement: Announcement = {
  badge: 'soon',
  link: `#${EMAIL_CTA_ID}`,
  text: 'Python code generator',
};
