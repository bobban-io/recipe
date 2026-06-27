import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Container, Theme } from "@radix-ui/themes";
import { Header } from "~/ui/Header/Header";

import "normalize.css";
import "@radix-ui/themes/styles.css";
import "~/styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Recipe - bobban.io" },
      { name: "description", content: "Master the baking experience" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Theme appearance="dark" accentColor="amber" grayColor="sand">
        <Header />

        <Container px="4" maxWidth="640px" asChild>
          <main>
            <Outlet />
          </main>
        </Container>
      </Theme>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
