import {
  TimestampStrategy,
  StringTimestamp,
  FirestoreTimestamp,
  NullTimestamp,
} from "./timestampStrategy";

export function formatTimestamp(ts: any): string {
  let strategy: TimestampStrategy;

  if (!ts) {
    strategy = new NullTimestamp();
  } else if (typeof ts === "string") {
    strategy = new StringTimestamp();
  } else if (ts._seconds) {
    strategy = new FirestoreTimestamp();
  } else {
    strategy = new NullTimestamp();
  }

  return strategy.format(ts);
}
