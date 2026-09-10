/**
 * Canonical permission codes. Must stay in sync with database/prisma/seed.ts.
 * Used with the @RequirePermissions() decorator to guard endpoints.
 */
export const PERMISSIONS = {
  MEMBER_VIEW: 'member.view',
  MEMBER_CREATE: 'member.create',
  MEMBER_UPDATE: 'member.update',
  MEMBER_DELETE: 'member.delete',

  VISITOR_VIEW: 'visitor.view',
  VISITOR_CREATE: 'visitor.create',
  VISITOR_UPDATE: 'visitor.update',
  VISITOR_DELETE: 'visitor.delete',

  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_CREATE: 'attendance.create',
  ATTENDANCE_UPDATE: 'attendance.update',
  ATTENDANCE_DELETE: 'attendance.delete',

  MINISTRY_VIEW: 'ministry.view',
  MINISTRY_CREATE: 'ministry.create',
  MINISTRY_UPDATE: 'ministry.update',
  MINISTRY_DELETE: 'ministry.delete',

  GROUP_VIEW: 'group.view',
  GROUP_CREATE: 'group.create',
  GROUP_UPDATE: 'group.update',
  GROUP_DELETE: 'group.delete',

  LEADERSHIP_VIEW: 'leadership.view',
  LEADERSHIP_CREATE: 'leadership.create',
  LEADERSHIP_UPDATE: 'leadership.update',
  LEADERSHIP_DELETE: 'leadership.delete',

  FINANCE_VIEW: 'finance.view',
  FINANCE_CREATE: 'finance.create',
  FINANCE_UPDATE: 'finance.update',
  FINANCE_DELETE: 'finance.delete',
  FINANCE_REPORT: 'finance.report',

  EVENT_VIEW: 'event.view',
  EVENT_CREATE: 'event.create',
  EVENT_UPDATE: 'event.update',
  EVENT_DELETE: 'event.delete',

  SERMON_VIEW: 'sermon.view',
  SERMON_CREATE: 'sermon.create',
  SERMON_UPDATE: 'sermon.update',
  SERMON_DELETE: 'sermon.delete',

  NEWS_VIEW: 'news.view',
  NEWS_CREATE: 'news.create',
  NEWS_UPDATE: 'news.update',
  NEWS_DELETE: 'news.delete',

  ANNOUNCEMENT_VIEW: 'announcement.view',
  ANNOUNCEMENT_CREATE: 'announcement.create',
  ANNOUNCEMENT_UPDATE: 'announcement.update',
  ANNOUNCEMENT_DELETE: 'announcement.delete',

  // Deliberately separate from member.view — prayer requests are private
  // pastoral data (section 56), not general member-record access, so a
  // role like Secretary (which has member.view) must NOT automatically see them.
  PRAYER_REQUEST_VIEW: 'prayer-request.view',
  PRAYER_REQUEST_UPDATE: 'prayer-request.update',

  MEDIA_VIEW: 'media.view',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_UPDATE: 'media.update',
  MEDIA_DELETE: 'media.delete',

  WEBSITE_PUBLISH: 'website.publish',

  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  SETTINGS_MANAGE: 'settings.manage',
  AUDIT_VIEW: 'audit.view',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
