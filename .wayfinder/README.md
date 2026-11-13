# Wayfinder tracker (local markdown)

Maps and tickets for wayfinding efforts. One directory per map; the map and its tickets are
plain markdown files with YAML frontmatter.

## Wayfinding operations

- **Map**: `<map-dir>/map.md`, labelled `labels: [wayfinder:map]`. It's an index: Destination,
  Notes, Decisions so far, Not yet specified, Out of scope. Open tickets are not listed in it.
- **Ticket**: `<map-dir>/NN-slug.md`, a child of the map in the same directory. Its id is `NN`,
  its name is the frontmatter `title`, its type is `labels: [wayfinder:<research|prototype|grilling|task>]`.
  The body is a `## Question`.
- **Status**: frontmatter `status: open | closed`.
- **Claim**: set `assignee:` before any work. An empty `assignee` means unclaimed.
- **Blocking**: frontmatter `blocked-by: [NN, ...]` (there's no native blocking here, so this is
  the convention). A ticket is unblocked when every ticket it lists is `status: closed`.
- **Frontier**: open, unblocked, unclaimed tickets. To find them, list the open ones and check
  their `blocked-by`:

  ```sh
  grep -l '^status: open' .wayfinder/<map-dir>/[0-9]*.md | xargs grep -H -E '^(title|assignee|blocked-by):'
  ```

- **Resolve**: append a dated `## Resolution` section to the ticket, set `status: closed`, and add
  one line to the map's **Decisions so far** linking the ticket.
- **Out of scope**: set `status: closed` and `closed-as: out-of-scope`, and add one line to the
  map's **Out of scope** linking the ticket. Not added to Decisions so far.
- **Assets** (research files, prototypes): link them from the ticket, don't paste them in.
  Research findings live on throwaway `research/<name>` branches.
