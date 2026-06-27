import { Container, Section, Text } from "@radix-ui/themes";

export function Header() {
  return (
    <header>
      <Section>
        <Container px="4" maxWidth="640px">
          <Text size="8" weight="bold">
            recipe.
          </Text>
        </Container>
      </Section>
    </header>
  );
}
