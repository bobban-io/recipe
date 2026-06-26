import { Link, Text } from "@radix-ui/themes";
import { addTime } from "~/utils/addTime";
import { formatTemperature } from "~/utils/formatTemperature";
import { formatTime } from "~/utils/formatTime";

type Props = {
  startDate: Date;
};

export function InstructionList(props: Props) {
  const { startDate } = props;

  return (
    <ul style={{ listStyleType: "none" }}>
      <li>
        <Text weight="medium">
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(startDate)}</span>
          Feed your starter and measure the water
        </Text>
      </li>
      <li style={{ paddingLeft: "90px", marginBottom: "var(--space-2)" }}>
        <Text size="2" color="gray">
          Feed your starter so it can double in size by around {formatTime(addTime(startDate, 5))} — it should be bubbly
          and slightly domed on top when ready. Also, measure up the water now and let it sit at room temperature so
          it’s not too cold when mixing later.
        </Text>
      </li>
      <li>
        <Text weight="medium">
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 5))}</span>
          Mix water, starter and flour
        </Text>
      </li>
      <li style={{ paddingLeft: "90px", marginBottom: "var(--space-2)" }}>
        <Text size="2" color="gray">
          Combine the water, starter, and both flours. You don’t need to knead aggressively — just make sure everything
          is evenly mixed with no dry spots. Cover and let it rest.
        </Text>
      </li>
      <li>
        <Text weight="medium">
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 5, 30))}</span>
          Add salt
        </Text>
      </li>
      <li style={{ paddingLeft: "90px", marginBottom: "var(--space-2)" }}>
        <Text size="2" color="gray">
          Sprinkle in the salt and gently incorporate it into the dough by squeezing and folding.
        </Text>
      </li>
      <li>
        <Text weight="medium">
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 6))}</span>
          Begin folding the dough
        </Text>
      </li>
      <li style={{ paddingLeft: "90px", marginBottom: "var(--space-2)" }}>
        <Text size="2" color="gray">
          Perform a series of folds every 30 minutes for about 2 hours (4 sets total). Each time, start at one side,
          grab the dough, stretch it upward, and fold it over itself. Rotate the bowl and repeat on all sides. After the
          last fold, let the dough rest undisturbed until preshape time.
        </Text>
      </li>
      <li>
        <Text weight="medium">
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 9, 30))}</span>
          Preshape
        </Text>
      </li>
      <li style={{ paddingLeft: "90px", marginBottom: "var(--space-2)" }}>
        <Text size="2" color="gray">
          Turn the dough out onto a clean, dry (non-floured) surface. Preshape it using your hands or a bench scraper,
          building surface tension and creating a smooth, tight round. See{" "}
          <Link href="https://www.youtube.com/shorts/l5GdlI-Vf_Q" target="_blank">
            this video
          </Link>{" "}
          if needed. Let it rest.
        </Text>
      </li>
      <li>
        <Text weight="medium">
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 10, 0))}</span>
          Shape and refrigerate
        </Text>
      </li>
      <li style={{ paddingLeft: "90px", marginBottom: "var(--space-2)" }}>
        <Text size="2" color="gray">
          Lightly flour the top of the dough, then flip it upside down. Stretch it gently into a rectangle and fold it
          like an envelope. Cross-fold the sides, then roll it up tightly. See{" "}
          <Link href="https://www.youtube.com/shorts/j4a1knyyaZk" target="_blank">
            this video
          </Link>{" "}
          if you’re unsure about the technique. Place the dough seam-side up in a floured proofing basket, then
          refrigerate overnight.
        </Text>
      </li>
      <li>
        <Text weight="medium">
          <span style={{ minWidth: "90px", display: "inline-block" }}>Next day</span>
          Bake
        </Text>
      </li>
      <li style={{ paddingLeft: "90px", marginBottom: "var(--space-2)" }}>
        <Text size="2" color="gray">
          Preheat your oven to {formatTemperature(230)} (top and bottom heat). Score the dough and bake for about 20
          minutes with steam, then another 20 minutes without steam, until the crust is golden brown and the loaf’s
          internal temperature reaches around 96 °C. If your oven doesn’t have a steam function, add a small tray with
          water or ice cubes on the bottom shelf during the first 20 minutes.
        </Text>
      </li>
    </ul>
  );
}
