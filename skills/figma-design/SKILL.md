---
name: figma-design
description: "This skill should be used when the user asks to 'read Figma file', 'get Figma design', 'create Figma frame', 'export Figma screenshot', 'design in Figma', 'create UI mockup', 'draw wireframe', 'generate excalidraw', or references Figma design files, Excalidraw wireframes, mockups, or UI components for game design. Includes Excalidraw fallback when Figma is unavailable."
version: 1.0.0
---

# Figma Design Skill

## Overview

This skill enables interaction with Figma files through the figma-mcp-go MCP server. The integration works via a Figma desktop plugin bridge, so there's no API token required and no rate limits to worry about. All operations run against the currently open Figma file in the desktop app.

Use this skill to read existing UI mockups, extract design tokens, create new frames and components, take screenshots for review, and perform bulk text operations. Combined with the game-ui-ux skill, it supports a full theory-backed design review and iteration loop.

---

## Prerequisites

The figma-mcp-go desktop plugin must be running inside the target Figma file before any tool calls will work.

Install the plugin from `plugin.zip` at: https://github.com/vkhanhqui/figma-mcp-go/releases

Once installed, open the plugin panel inside Figma and keep it active. The MCP server communicates through this plugin bridge. If tool calls return errors or empty results, check that the plugin is open and the correct file is in focus.

---

## Available Tools

### Document and Selection

**`get_document`** — Fetches the full document tree. Use sparingly on large files; prefer `get_design_context` with a depth limit instead.

**`get_metadata`** — Returns file-level metadata: name, last modified, version, and editor type.

**`get_pages`** — Lists all pages in the document with their IDs and names. Always call this first when working with an unfamiliar file.

**`get_selection`** — Returns the nodes currently selected by the user in Figma. Start here when the user says "look at this" or "work with what I have selected."

**`get_node`** — Fetches a single node by ID with full property detail.

**`get_nodes_info`** — Fetches lightweight info for multiple nodes at once. More efficient than calling `get_node` in a loop.

**`get_design_context`** — Returns a structured summary of the document optimized for LLM consumption. Accepts a depth parameter to limit traversal. This is the most token-efficient way to understand a file's structure.

**`search_nodes`** — Searches nodes by name, type, or property. Use to locate specific components or layers without traversing the full tree.

**`scan_text_nodes`** — Returns all text nodes in the document or a subtree. Essential for localization and copy audits.

**`scan_nodes_by_types`** — Filters nodes by one or more Figma node types (FRAME, TEXT, RECTANGLE, etc.). Useful for targeted audits.

**`get_viewport`** — Returns the current viewport position and zoom level.

---

### Creation

**`create_frame`** — Creates a new frame at a specified position and size. Frames are the primary container for UI screens and components in Figma.

**`create_rectangle`** — Creates a rectangle node. Use for backgrounds, cards, buttons, and other box-shaped UI elements.

**`create_ellipse`** — Creates an ellipse or circle node. Useful for avatars, health orbs, and circular indicators common in game UI.

**`create_text`** — Creates a text node with specified content, font, and size.

**`import_image`** — Imports an image into the document. Accepts a URL or base64 data. Use for adding placeholder art, icons, or reference screenshots.

---

### Modification

**`set_text`** — Updates the string content of a text node. Accepts a node ID and new text value.

**`set_fills`** — Sets the fill color or gradient of a node. Accepts RGBA values or gradient definitions.

**`set_strokes`** — Sets stroke color, weight, and alignment on a node.

**`move_nodes`** — Moves one or more nodes to new x/y coordinates.

**`resize_nodes`** — Resizes one or more nodes to new width/height values.

**`rename_node`** — Renames a node. Keep naming consistent with the project's layer naming conventions.

**`clone_node`** — Duplicates a node. The clone appears at the same position; use `move_nodes` immediately after to place it correctly.

**`delete_nodes`** — Deletes one or more nodes by ID. Confirm with the user before deleting anything that isn't clearly temporary.

---

### Styles and Variables

**`get_styles`** — Returns all local styles: colors, text styles, effects, and grids. This is the primary source for extracting the design token system.

**`get_variable_defs`** — Returns Figma variable definitions (the newer token system). Check both `get_styles` and `get_variable_defs` when documenting a design system, since files may use either or both.

**`get_local_components`** — Lists all local components and component sets. Use to understand the component library before creating new UI elements.

**`get_annotations`** — Returns design annotations attached to nodes. Useful for reading spec notes left by designers.

**`get_fonts`** — Lists all fonts used in the document. Cross-reference against the game's font spec to catch inconsistencies.

**`get_reactions`** — Returns prototype interactions and transitions defined on nodes.

---

### Screenshots

**`get_screenshot`** — Captures a screenshot of a specific node or the current viewport. Returns image data. Use for visual review, documentation, or passing to the ui-ux-reviewer agent.

**`save_screenshots`** — Saves screenshots of multiple nodes to disk. Useful for batch-exporting all screens in a flow.

---

### Strategies

Strategies are higher-level operations that combine multiple tool calls into a single workflow.

**`read_design_strategy`** — Reads and summarizes a design in a structured way. Good starting point for any review task.

**`design_strategy`** — Executes a multi-step design operation based on a natural language description. Use when the task involves several coordinated changes.

**`text_replacement_strategy`** — Scans all text nodes and replaces content according to a mapping. The primary tool for localization and copy updates.

**`annotation_conversion_strategy`** — Converts annotations into a structured format for documentation or handoff.

**`swap_overrides_instances`** — Swaps component instances while preserving overrides. Use when updating a component library and propagating changes.

**`reaction_to_connector_strategy`** — Converts prototype reactions into FigJam connector arrows. Useful for visualizing user flows.

---

## Common Workflows for Game Design

### Reviewing an Existing UI Mockup

1. Call `get_pages` to understand the file structure.
2. Call `get_design_context` with a moderate depth (3-4) to get a token-efficient overview.
3. Call `get_screenshot` on the relevant frames to capture visuals.
4. Analyze layout, hierarchy, and visual language against game-ui-ux principles.
5. Document findings and flag issues with specific node IDs for traceability.

### Extracting the Design Token System

1. Call `get_styles` to retrieve color, text, and effect styles.
2. Call `get_variable_defs` to check for variable-based tokens.
3. Call `get_fonts` to list all typefaces in use.
4. Compile into a structured token reference: color palette, type scale, spacing, and effects.
5. Cross-reference against `ui-ux-spec.md` if one exists in the project.

### Creating a New UI Frame

1. Call `get_pages` and `get_local_components` to understand the existing system.
2. Call `create_frame` with the target screen dimensions.
3. Add background with `create_rectangle` + `set_fills`.
4. Add text labels with `create_text`.
5. Clone existing components with `clone_node` + `move_nodes` rather than building from scratch when matching components exist.
6. Call `get_screenshot` to capture the result for review.

### Taking Screenshots for Review

1. Call `get_pages` to identify the relevant page.
2. Call `search_nodes` or `scan_nodes_by_types` with type FRAME to list top-level screens.
3. Call `save_screenshots` with the frame IDs to export all screens at once.
4. Pass screenshots to the ui-ux-reviewer agent for structured feedback.

### Text Localization or Copy Update

1. Call `scan_text_nodes` to get all text content with node IDs.
2. Build a replacement mapping from old strings to new strings.
3. Call `text_replacement_strategy` with the mapping to apply all changes in one pass.
4. Call `get_screenshot` on affected frames to verify the result visually.

---

## Best Practices

**Start with context, not the full tree.** `get_design_context` with a depth limit is almost always the right first call. `get_document` on a large file can return tens of thousands of tokens and slow everything down.

**Work from the user's selection.** When the user says "look at this" or points to something specific, call `get_selection` first. It's faster and more precise than searching.

**Batch node operations.** `get_nodes_info` and `save_screenshots` accept arrays. Avoid calling single-node tools in a loop when a batch version exists.

**Confirm before deleting.** `delete_nodes` is irreversible within the current session. Always confirm with the user unless the nodes were just created in the same task.

**Name layers consistently.** When creating nodes, use descriptive names that match the project's naming convention. Unnamed or auto-named layers make future searches unreliable.

**Combine with game-ui-ux for theory-backed review.** This skill handles the mechanical interaction with Figma. The game-ui-ux skill provides the design theory, heuristics, and evaluation criteria. Use both together for a complete review workflow: extract the design with figma-design tools, then evaluate it through the game-ui-ux lens.

**Check the plugin is active if tools fail.** The most common failure mode is the Figma desktop plugin not being open. If calls return errors or empty results, switch to Excalidraw fallback mode.

---

## Excalidraw Fallback

When Figma is unavailable (plugin not running, desktop app closed, or tool errors), generate `.excalidraw` files instead. Excalidraw files are plain JSON — no external tools or connections required.

### File Format

Each `.excalidraw` file has this top-level structure:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": { "gridSize": null, "viewBackgroundColor": "#fafafa" },
  "files": {}
}
```

### Element Mapping

Map game UI elements to Excalidraw primitives:

| UI Element | Excalidraw Type | Key Properties |
|---|---|---|
| Screen frame | `rectangle` | 390×844, solid fill |
| Button | `rectangle` | roundness `{"type": 3}`, accent fill, labeled with separate `text` element |
| Header/body text | `text` | fontSize 24/16, fontFamily 1 |
| Icon placeholder | `ellipse` | 40×40 |
| Nav bar | `rectangle` | full-width, bottom-positioned |
| Screen flow | `arrow` | endArrowhead `"arrow"`, connect screen rectangles |

### Viewing Generated Files

Open `.excalidraw` files at https://excalidraw.com (drag and drop) or install the Excalidraw extension in VS Code.

### When to Use Figma vs Excalidraw

| Scenario | Tool |
|---|---|
| Figma desktop open + plugin running | Figma (primary) |
| No Figma or plugin errors | Excalidraw (automatic fallback) |
| Quick wireframes without setup | Excalidraw (always available) |
| Reviewing existing Figma designs | Figma only (needs the file) |
