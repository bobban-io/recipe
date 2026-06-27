import { Container, Section, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header>
      <Section size="2">
        <Container px="4" maxWidth="640px">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Text size="8" weight="bold">
              recipe.
            </Text>
          </Link>
        </Container>
      </Section>
    </header>
  );
}
