import { Container } from "@radix-ui/themes";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Container px="4" maxWidth="640px" asChild>
      <main>{children}</main>
    </Container>
  );
}
