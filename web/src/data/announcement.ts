type Announcement = {
  badge?: 'soon';
  link?: string;
  scrollTo?: string;
  text: string;
} | null;

export const announcement: Announcement = {
  badge: 'soon',
  link: '#email-cta',
  scrollTo: 'email-cta',
  text: 'Python code generator',
};
