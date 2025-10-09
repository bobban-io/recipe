import { Text } from "@radix-ui/themes";
import { addTime } from "~/utils/addTime";
import { formatTime } from "~/utils/formatTime";

type Props = {
  startDate: Date;
};

export function InstructionList(props: Props) {
  const { startDate } = props;

  return (
    <ul style={{ listStyleType: "none" }}>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(startDate)}</span>
          Feed your starter and pour up water
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 5))}</span>
          Mix water, starter and flour
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 5, 30))}</span>
          Mix in salt
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 6))}</span>
          Fold the dough (x4, every 30 min)
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 9, 30))}</span>
          Preshape
        </Text>
      </li>
      <li>
        <Text>
          <span style={{ minWidth: "90px", display: "inline-block" }}>{formatTime(addTime(startDate, 10, 0))}</span>
          Shape and let the dough rest in the refrigerator over night
        </Text>
      </li>
    </ul>
  );
}
