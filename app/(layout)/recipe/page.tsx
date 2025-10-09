import { InstructionList } from "./components/InstructionList";
import { IngredientList } from "./components/IngredientList";
import { recipeSchema } from "./schemas/recipeSchema";
import { Heading, Section } from "@radix-ui/themes";

export async function validateSearchParams(page: PageProps<never>) {
  const searchParams = await page.searchParams;
  return recipeSchema.parse(searchParams);
}

export default async function Page(props: PageProps<never>) {
  const params = await validateSearchParams(props);

  return (
    <Section>
      <Heading size="8" mb="5">
        Recipe
      </Heading>

      <IngredientList ingredients={params} />

      <Heading size="6" mb="5" mt="7">
        Step by step
      </Heading>

      <InstructionList startDate={params.startDate} />
    </Section>
  );
}
