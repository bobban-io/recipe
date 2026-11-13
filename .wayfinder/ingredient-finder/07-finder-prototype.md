---
id: 7
title: Finder prototype
labels: [wayfinder:prototype]
status: closed
assignee: Robin Bertilsson (2026-11-13)
blocked-by: [3, 6]
---

## Question

How does the finder look and behave? Build a rough, clickable prototype to react to, covering:

- where the finder lives (its own page, or a mode of the home page next to the existing search);
- how ingredients and amounts are entered;
- how a result shows what's covered and what's missing, including a copyable shopping list,
  optional ingredients, recipes you can make now, shortfalls and the largest yield;
- how combos are shown: their own section after the single suggestions, at most three, with a
  combined buy list (see [Recipe combos](06-recipe-combos.md));
- how categories filter both the finder and the main recipe list.

Settle the Swedish names for the feature and its parts here.

## Resolution (2026-11-13)

Prototype: commit `1f512ab` on the throwaway branch `prototype/finder`, checked out in the worktree
`.claude/worktrees/finder-prototype` (run `bun run dev` there). It runs the decided rules on the 11
real recipes. A Prototyp panel switches between the variants below and loads the sample fridges
from the earlier tickets. It never merges.

**Where the finder lives.** A tab on the home page, a switch under the heading reading "Alla
recept | Vad har du hemma?". Chosen over a page of its own because the search box and the picker
never show at once, and one category filter serves both tabs. The filter keeps its choice when
you switch tabs.

**Entering what you have.** A type-ahead field, "Lägg till något du har hemma", searches catalog
names and aliases. An alias match shows as "Fläskfilé (Fläskytterfilé)". Arrow keys and Enter
pick. Each pick becomes a row with the ingredient's name, an optional amount field with the entry
unit after it (g, dl or st), and a remove button. A line under the rows says the amount is
optional, and "Börja om" clears them. Before anything is entered, the finder says "Börja med något
du har, till exempel kyckling eller ägg."

**A suggestion** is a card under "Förslag", in ranking order. It shows:

- the title, linking to the recipe at its default yield, and the recipe's category;
- a status. "Du har allt" means you can make it now. "Du har allt för 6 av 12 muffins" means you
  can make it now at a smaller yield. "Saknar 8" counts missing ingredients. "Räcker inte" means
  nothing is missing but your amounts don't cover one unit;
- "Använder 3 av dina 4: kyckling, citron och vitlök";
- when you're short and something is also missing, an orange line such as "Det du har räcker
  till 2 av 6 portioner." or "Det du har räcker inte till 1 limpa.";
- "Att köpa" followed by the names, shortfalls first as "mer kyckling";
- a "Visa inköpslistan" button that opens the buy list. Each line has an amount and a name, and a
  shortfall adds "du har 400 g". A caption says the amounts are for the recipe's default yield.
  "Kopiera listan" copies one line per item ("600 g Kyckling") and changes to "Listan kopierad";
- "Valfritt: grönsaker" for optional ingredients you don't have.

Buy-list amounts are in the entry unit, and small volumes step down to msk, tsk or krm the way the
recipe page does it. Every item gets an amount, even soy sauce or oil where you'd buy a bottle.
One rule for all items is simpler than choosing which ones get amounts.

**Combos** come after the suggestions under "Två recept tillsammans", with the line "De här paren
använder fler av dina ingredienser än något enskilt recept." A combo card lists both titles, the
second prefixed with "+", then a status, "Använder 7 av dina 9", and one buy list for both. An
ingredient both recipes need appears once, with the amounts added.

The single suggestion a combo has to beat is the one that uses the most of your ingredients, not
the top-ranked one. With the baking-day fridge, Surdegsbröd ranks first (you have everything, it
uses 3), but combos are measured against Kladdkaksmuffins (uses 5). This matches the table in
[Recipe combos](06-recipe-combos.md).

**Category filter.** One row of single-choice chips: Alla, Vardagsmat, Helgmat, Bröd, Bakverk,
and Efterrätter once a dessert exists. Vardagsmat and Helgmat are huvudrätter with that occasion,
so "helg implies huvudrätt" needs no rule of its own. Chosen over two levels (dish type, then
Vardag or Helg under Huvudrätter). The cost is that you can't pick all huvudrätter, which is 9 of
the 11 recipes anyway. The filter narrows the recipe list together with the free-text search, and
it narrows the finder, where both recipes in a combo have to pass. Recipe cards and suggestions
name the category with the chip's word (Vardagsmat, Bröd); the prototype still shows "Huvudrätt ·
Vardag". When nothing passes, the list says "Inga recept i den här kategorin." and the finder says
"Inget recept i den här kategorin använder det du har. Välj Alla för att se fler."

**Within one visit**, what you entered survives opening a recipe and going back. The page holds it
in memory, not in the URL, so a reload clears it. Remembering it between visits is out of scope.

**Swedish names**, settled with the user:

| Term                | In the UI                                             |
| ------------------- | ----------------------------------------------------- |
| Ingredient finder   | Vad har du hemma?                                     |
| Suggestion          | Förslag                                               |
| Can make now        | Du har allt                                           |
| Missing ingredients | Saknar N                                              |
| Buy list            | Att köpa (the names), inköpslistan, Kopiera listan    |
| Largest yield       | Det du har räcker till X av Y portioner (or limpor …) |
| Optional line       | Valfritt                                              |
| Combo               | Två recept tillsammans                                |
| Vardag, Helg        | Vardagsmat, Helgmat                                   |

**Handed on:**

- Catalog and frontmatter format: the prototype used 10 g per dl for Torkad oregano, a starting
  value to set beside the ones Quantity-aware matching suggested.
- The build: the prototype code in `src/prototype/` is throwaway. Its matching reproduces every
  sample fridge in the tickets, so it can serve as a reference for tests, not as a base to build on.

Terms recorded in [CONTEXT.md](../../CONTEXT.md): buy list.
