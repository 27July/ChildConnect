export interface TimestampStrategy {
  format(ts: any): string;
}

export class StringTimestamp implements TimestampStrategy {
  format(ts: string) {
    return new Date(ts).toLocaleString();
  }
}

export class FirestoreTimestamp implements TimestampStrategy {
  format(ts: { _seconds: number }) {
    return new Date(ts._seconds * 1000).toLocaleString();
  }
}

export class NullTimestamp implements TimestampStrategy {
  format(_: any) {
    return "-";
  }
}
