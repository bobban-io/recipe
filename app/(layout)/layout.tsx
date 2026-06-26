import { Container } from "@radix-ui/themes";
import { Fragment, PropsWithChildren } from "react";
import { Header } from "~/ui/Header/Header";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <Fragment>
      <Header />

      <Container px="4" maxWidth="640px" asChild>
        <main>{children}</main>
      </Container>
    </Fragment>
  );
}
