import { Badge } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";
import type { Status } from "~/lib/finderText";

const COLORS = { ready: "grass", missing: "gray", short: "orange" } as const;

/** A suggestion's or a combo's status, from `suggestionStatus` or `matchStatus`. */
export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge size="2" radius="full" color={COLORS[status.tone]}>
      {status.tone === "ready" && <CheckIcon aria-hidden />}
      {status.text}
    </Badge>
  );
}
