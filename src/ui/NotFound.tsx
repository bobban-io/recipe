import { Button, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <Section>
      <Flex direction="column" align="start" gap="4">
        <Heading size="7">Hittades inte</Heading>
        <Text color="gray">Vi hittade inte det receptet.</Text>
        <Button asChild>
          <Link to="/">Visa alla recept</Link>
        </Button>
      </Flex>
    </Section>
  );
}
