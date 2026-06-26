import { InstructionList } from "./components/InstructionList";
import { IngredientList } from "./components/IngredientList";
import { recipeSchema } from "./schemas/recipeSchema";
import { Button, Flex, Heading, Section } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export async function validateSearchParams(page: PageProps<never>) {
  const searchParams = await page.searchParams;
  return recipeSchema.parse(searchParams);
}

export default async function Page(props: PageProps<never>) {
  const params = await validateSearchParams(props);

  return (
    <Section>
      <Flex justify="between" align="center" mb="5">
        <Heading size="6">Recipe</Heading>
        <Link href="/sourdough/calculator">
          <Button variant="ghost">
            <ArrowLeftIcon />
            Back to calculator
          </Button>
        </Link>
      </Flex>

      <IngredientList ingredients={params} />

      <Heading size="6" mb="5" mt="7">
        Step by step
      </Heading>

      <InstructionList startDate={params.startDate} />
    </Section>
  );
}
