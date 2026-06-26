import { CalculatorForm } from "./components/CalculatorForm";
import { Heading, Section } from "@radix-ui/themes";

export default function Page() {
  return (
    <Section>
      <Heading size="6" mb="5">
        Calculator
      </Heading>

      <CalculatorForm />
    </Section>
  );
}
