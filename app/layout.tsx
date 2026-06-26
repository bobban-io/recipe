import { PropsWithChildren } from "react";
import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";

import "@radix-ui/themes/styles.css";

export const metadata: Metadata = {
  title: "Bakr",
  description: "Master the baking experience",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <Theme appearance="dark">{children}</Theme>
      </body>
    </html>
  );
}
