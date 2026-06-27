import { Button, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <Section>
      <Flex direction="column" align="start" gap="4">
        <Heading size="7">Not found</Heading>
        <Text color="gray">We couldn&apos;t find that recipe.</Text>
        <Button asChild>
          <Link to="/">Browse all recipes</Link>
        </Button>
      </Flex>
    </Section>
  );
}
