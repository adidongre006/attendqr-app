import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * Teachers / admins. The only accounts that can start attendance sessions,
 * manage the student roster, and export spreadsheets. Created via the seed
 * script (scripts/seed-admin.ts) — there is intentionally no public sign-up.
 */
export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Students. rollNo is the login identifier and doubles as the human-facing
 * ID used throughout the UI and the exported spreadsheet.
 */
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  rollNo: varchar('roll_no', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  className: varchar('class_name', { length: 50 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * A live "roll call" started by a teacher for one class/subject on one date.
 * The rotating QR token (see lib/qr-token.ts) is generated on demand and is
 * always scoped to a sessionId — nothing about the rotating token itself is
 * persisted, only the session it belongs to.
 */
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id')
    .notNull()
    .references(() => teachers.id, { onDelete: 'cascade' }),
  className: varchar('class_name', { length: 50 }).notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  sessionDate: date('session_date').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  isActive: boolean('is_active').default(true).notNull(),
});

/**
 * One row per student per session. ipAddress is captured server-side at the
 * moment attendance is marked (see lib/get-ip.ts) — it is never sent by the
 * client — which is what makes it useful as a proxy-attendance signal.
 * The unique index stops a student marking the same session twice.
 */
export const attendance = pgTable(
  'attendance',
  {
    id: serial('id').primaryKey(),
    sessionId: integer('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    ipAddress: varchar('ip_address', { length: 64 }).notNull(),
    attendanceDate: date('attendance_date').notNull(),
    markedAt: timestamp('marked_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqSessionStudent: uniqueIndex('uniq_session_student').on(
      table.sessionId,
      table.studentId
    ),
  })
);
