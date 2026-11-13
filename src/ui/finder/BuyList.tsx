import { useEffect, useId, useRef, useState } from "react";
import { Box, Button, Text } from "@radix-ui/themes";
import { CheckIcon, ChevronDownIcon, CopyIcon } from "@radix-ui/react-icons";
import { buyList, buyListText, formatBuyAmount, formatOnHandAmount, type BuyItem, type Shortfall } from "~/lib/buyList";
import { toBuyNames } from "~/lib/finderText";

type Props = {
  shortfalls: readonly Shortfall[];
  missing: readonly BuyItem[];
  /** The line above the items, saying what the amounts are for. */
  caption: string;
};

/**
 * What a suggestion or a combo still needs: "Att köpa: …" and a button that shows the buy list,
 * with amounts and a copy button. Nothing shows when there's nothing to buy.
 */
export function BuyList({ shortfalls, missing, caption }: Props) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const items: (BuyItem | Shortfall)[] = buyList({ shortfalls, missing });
  if (items.length === 0) return null;

  return (
    <Box mt="3">
      <Text as="p" size="2">
        <Text weight="medium">Att köpa:</Text> <Text color="gray">{toBuyNames({ shortfalls, missing })}</Text>
      </Text>
      <Button
        size="2"
        variant="ghost"
        mt="3"
        className="buy-list-toggle"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
      >
        {open ? "Dölj inköpslistan" : "Visa inköpslistan"}
        <ChevronDownIcon aria-hidden />
      </Button>
      {open && (
        <div id={listId} className="buy-slip">
          <Text as="p" size="1" color="gray" mb="3">
            {caption}
          </Text>
          <ul>
            {items.map((item) => (
              <li key={item.ingredient}>
                <Text weight="bold" className="buy-slip-amount">
                  {formatBuyAmount(item.amount, item.unit)}
                </Text>
                <Text>
                  {item.ingredient}
                  {"have" in item && (
                    <Text size="2" color="gray">
                      {" "}
                      — du har {formatOnHandAmount(item.have, item.unit)}
                    </Text>
                  )}
                </Text>
              </li>
            ))}
          </ul>
          <CopyButton text={buyListText(items)} />
        </div>
      )}
    </Box>
  );
}

/** Copies the list's text, and reads "Listan kopierad" for two seconds after. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // No clipboard access: the label stays, so the button doesn't claim it worked.
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button size="2" variant="soft" mt="4" onClick={copy}>
      {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
      <span aria-live="polite">{copied ? "Listan kopierad" : "Kopiera listan"}</span>
    </Button>
  );
}
