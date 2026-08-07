import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import ExcelJS from 'exceljs';
import { db } from '@/lib/db';
import { attendance, students, sessions } from '@/lib/schema';
import { getTeacherFromCookies } from '@/lib/session';

const YELLOW_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFF176' }, // soft amber-yellow, ARGB required by ExcelJS
};

export async function GET(req: NextRequest) {
  const teacher = await getTeacherFromCookies();
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date'); // expected format: YYYY-MM-DD
  if (!date) {
    return NextResponse.json({ error: 'date query param is required, e.g. ?date=2026-08-06' }, { status: 400 });
  }

  // Every "present" record for the chosen date, joined with student + session info.
  const presentRows = await db
    .select({
      rollNo: students.rollNo,
      name: students.name,
      className: students.className,
      subject: sessions.subject,
      ipAddress: attendance.ipAddress,
      markedAt: attendance.markedAt,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .innerJoin(sessions, eq(attendance.sessionId, sessions.id))
    .where(eq(attendance.attendanceDate, date));

  // Full roster, so we can also list students who were absent that date.
  const allStudents = await db
    .select({ rollNo: students.rollNo, name: students.name, className: students.className })
    .from(students);
  const presentRollNos = new Set(presentRows.map((r) => r.rollNo));

  // --- Proxy / duplicate-device detection for this date ---
  // Group every present record by IP address. Any IP used by 2+ distinct
  // roll numbers on this date is "suspicious" — every row with that IP
  // gets highlighted yellow so the teacher can review it manually. This is
  // a signal, not an accusation: shared classroom Wi-Fi can trigger it
  // legitimately, which is exactly why it's surfaced for a human to check
  // rather than auto-marked absent.
  const ipToRollNos = new Map<string, Set<string>>();
  for (const r of presentRows) {
    if (!ipToRollNos.has(r.ipAddress)) ipToRollNos.set(r.ipAddress, new Set());
    ipToRollNos.get(r.ipAddress)!.add(r.rollNo);
  }
  const suspiciousIps = new Set(
    [...ipToRollNos.entries()].filter(([, rolls]) => rolls.size > 1).map(([ip]) => ip)
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AttendQR';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Attendance ${date}`, {
    views: [{ state: 'frozen', ySplit: 1 }], // freeze header row
  });

  sheet.columns = [
    { header: 'Roll No', key: 'rollNo', width: 14 },
    { header: 'Name', key: 'name', width: 26 },
    { header: 'Class', key: 'className', width: 14 },
    { header: 'Subject', key: 'subject', width: 18 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Time Marked', key: 'time', width: 14 },
    { header: 'IP Address', key: 'ip', width: 18 },
  ];
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171C2C' } };
  });

  for (const r of presentRows) {
    const row = sheet.addRow({
      rollNo: r.rollNo,
      name: r.name,
      className: r.className,
      subject: r.subject,
      status: 'Present',
      time: new Date(r.markedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ip: r.ipAddress,
    });

    if (suspiciousIps.has(r.ipAddress)) {
      row.eachCell((cell) => {
        cell.fill = YELLOW_FILL;
      });
    }
  }

  // Absentees: every roster student who has no record for this date.
  for (const s of allStudents) {
    if (!presentRollNos.has(s.rollNo)) {
      sheet.addRow({
        rollNo: s.rollNo,
        name: s.name,
        className: s.className,
        subject: '-',
        status: 'Absent',
        time: '-',
        ip: '-',
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="attendance-${date}.xlsx"`,
    },
  });
}
