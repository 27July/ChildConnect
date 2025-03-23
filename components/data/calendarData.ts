export function getPresenceColor(isPresent: boolean): string {
    return isPresent ? 'green' : 'red';
  }

export const attendanceData = [
    { date: '2025-02-01', isPresent: true },
    { date: '2025-02-02', isPresent: false },
    { date: '2025-02-03', isPresent: true },
    { date: '2025-02-04', isPresent: true },
    { date: '2025-02-05', isPresent: false },
    { date: '2025-02-06', isPresent: true },
    { date: '2025-02-07', isPresent: false },
    { date: '2025-02-08', isPresent: true },
    { date: '2025-02-09', isPresent: false },
    { date: '2025-02-10', isPresent: true }
  ];