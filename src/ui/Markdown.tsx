import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Heading, Link as RadixLink, Text } from "@radix-ui/themes";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Heading size="6" mt="6" mb="4">
              {children}
            </Heading>
          ),
          h2: ({ children }) => (
            <Heading size="6" mt="6" mb="4">
              {children}
            </Heading>
          ),
          h3: ({ children }) => (
            <Heading size="4" mt="5" mb="3">
              {children}
            </Heading>
          ),
          p: ({ children }) => (
            <Text as="p" mb="3">
              {children}
            </Text>
          ),
          li: ({ children }) => (
            <li>
              <Text>{children}</Text>
            </li>
          ),
          strong: ({ children }) => (
            <Text as="span" weight="bold">
              {children}
            </Text>
          ),
          a: ({ href, children }) => (
            <RadixLink href={href} target="_blank" rel="noreferrer">
              {children}
            </RadixLink>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
