import { CalculatorForm } from "./components/CalculatorForm";
import { Heading, Section } from "@radix-ui/themes";

export default function Page() {
  return (
    <Section>
      <Heading mb="5" size="8">
        Calculator
      </Heading>

      <CalculatorForm />
    </Section>
  );
}
