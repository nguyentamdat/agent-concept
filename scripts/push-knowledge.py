#!/usr/bin/env python3
"""Push reference knowledge to Hindsight MCP server."""

import json
import os
import sys
import subprocess
import time

HINDSIGHT_URL = "https://hindsight.zingplay.dev/mcp/game-knowledge/"
API_KEY = os.environ.get("HINDSIGHT_API_KEY", "")
SESSION_ID = ""  # Will be set after init

# Tag mapping for reference files
FILE_TAGS = {
    "game-design-theories.md": ["theory", "game-design", "core"],
    "theory-knowledge-base.md": ["theory", "ui-ux", "core"],
    "art-style-guide.md": ["art", "style", "guide"],
    "gui-section-guide.md": ["guide", "writing", "gui"],
    "gameplay-section-guide.md": ["guide", "writing", "gameplay"],
    "screen-checklists.md": ["checklist", "ui-ux", "screens"],
    "concept-evaluation-criteria.md": ["evaluation", "concept", "review"],
    "concept-review-template.md": ["template", "concept", "review"],
    "gcd-template.md": ["template", "gcd"],
    "gcd-gameplay-template.md": ["template", "gcd", "gameplay"],
    "gdd-evaluation-criteria.md": ["evaluation", "gdd", "review"],
    "gdd-expected-sections.md": ["guide", "gdd", "structure"],
    "gdd-review-template.md": ["template", "gdd", "review"],
    "Mechanic-list.md": ["reference", "mechanics", "game-design"],
    "phase-a-outline-template.md": ["template", "phase-a", "pipeline"],
    "review-checklist.md": ["checklist", "review", "quality"],
}

# Context descriptions for each file
FILE_CONTEXT = {
    "game-design-theories.md": "12 game design theories in Vietnamese (MDA, Flow, Interest Curves, etc.)",
    "theory-knowledge-base.md": "UI/UX theory knowledge base: 15 sections covering UX pipeline, components, color theory, visual hierarchy",
    "art-style-guide.md": "Art style framework: casual/midcore/hardcore parameters, color psychology, output templates",
    "gui-section-guide.md": "Behavior-driven GUI section writing guide: layout, flow, interactions, feedback, edge cases",
    "gameplay-section-guide.md": "Gameplay section writing guide: flow, setup, rules, controls, win/lose conditions",
    "screen-checklists.md": "20 game screen type checklists with required/optional elements and UX/art guidelines",
    "concept-evaluation-criteria.md": "Concept pitch evaluation criteria and scoring rubric",
    "concept-review-template.md": "Template for concept pitch reviews with structured sections",
    "gcd-template.md": "Game Concept Document template structure",
    "gcd-gameplay-template.md": "GCD gameplay section template with detailed mechanics format",
    "gdd-evaluation-criteria.md": "Game Design Document evaluation criteria",
    "gdd-expected-sections.md": "Expected GDD sections and structure requirements",
    "gdd-review-template.md": "Template for GDD quality reviews",
    "Mechanic-list.md": "Reference list of common game mechanics and patterns",
    "phase-a-outline-template.md": "Phase A (concept) outline template for the design pipeline",
    "review-checklist.md": "Comprehensive review checklist for design documents",
}


def mcp_call(method, params, req_id=1):
    """Make an MCP JSON-RPC call to Hindsight via curl."""
    body = json.dumps({
        "jsonrpc": "2.0",
        "id": req_id,
        "method": method,
        "params": params,
    })

    cmd = [
        "curl", "-s", "-D", "-",
        "-X", "POST", HINDSIGHT_URL,
        "-H", f"Authorization: Bearer {API_KEY}",
        "-H", "Content-Type: application/json",
        "-H", "Accept: application/json, text/event-stream",
    ]
    if SESSION_ID:
        cmd += ["-H", f"Mcp-Session-Id: {SESSION_ID}"]
    cmd += ["-d", body]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        raw = result.stdout
        # Extract session ID from headers
        session = ""
        for line in raw.split("\n"):
            if line.lower().startswith("mcp-session-id:"):
                session = line.split(":", 1)[1].strip()
        # Find JSON data line (SSE format)
        for line in raw.split("\n"):
            if line.startswith("data: "):
                return json.loads(line[6:]), session
        # Try parsing last non-empty line as JSON
        for line in reversed(raw.split("\n")):
            line = line.strip()
            if line.startswith("{"):
                return json.loads(line), session
        return None, session
    except Exception as e:
        print(f"  ERROR: {e}")
        return None, ""


def init_session():
    """Initialize MCP session."""
    global SESSION_ID
    result, session = mcp_call("initialize", {
        "protocolVersion": "2025-03-26",
        "capabilities": {},
        "clientInfo": {"name": "push-knowledge", "version": "1.0.0"},
    })
    SESSION_ID = session
    if SESSION_ID:
        print(f"✓ Session: {SESSION_ID[:16]}...")
        # Send initialized notification
        mcp_call("notifications/initialized", {})
    else:
        print("✗ Failed to get session ID")
        sys.exit(1)
    return result


def tool_call(tool_name, arguments, req_id=1):
    """Call an MCP tool."""
    result, _ = mcp_call("tools/call", {"name": tool_name, "arguments": arguments}, req_id)
    return result


def retain_file(filepath, tags, context, document_id):
    """Push a file's content to Hindsight via retain."""
    with open(filepath, "r") as f:
        content = f.read()

    filename = os.path.basename(filepath)
    print(f"  Pushing {filename} ({len(content)} chars)...", end=" ", flush=True)

    result = tool_call("retain", {
        "content": content,
        "context": context,
        "tags": tags,
        "document_id": document_id,
    })

    if result and not result.get("result", {}).get("isError"):
        # Extract operation_id from result
        res_content = result.get("result", {}).get("content", [])
        if res_content:
            text = res_content[0].get("text", "")
            try:
                data = json.loads(text)
                op_id = data.get("operation_id", "?")
                print(f"✓ op={op_id[:12]}...")
            except:
                print(f"✓ {text[:60]}")
        else:
            print("✓")
    else:
        err = result.get("result", {}).get("content", [{}])[0].get("text", "unknown") if result else "no response"
        print(f"✗ {err[:80]}")

    return result


def main():
    if not API_KEY:
        print("ERROR: HINDSIGHT_API_KEY not set. Run: source .env")
        sys.exit(1)

    print("=" * 60)
    print("Push Knowledge to Hindsight (game-knowledge bank)")
    print("=" * 60)

    # 1. Initialize session
    print("\n[1/4] Initializing MCP session...")
    init_session()

    # 2. Update bank mission
    print("\n[2/4] Updating bank mission...")
    result = tool_call("update_bank", {
        "name": "Game Design Knowledge Base",
        "mission": "Store and retrieve game design knowledge for an AI-powered game design pipeline. Contains game design theories, UI/UX principles, art direction guides, evaluation criteria, templates, and reference materials from books and expert sources."
    })
    if result:
        print("  ✓ Bank mission updated")

    # 3. Create directive
    print("\n[3/4] Creating knowledge directive...")
    result = tool_call("create_directive", {
        "name": "Game Knowledge Retrieval",
        "content": "This bank stores game design knowledge for a Claude Code plugin that creates game concepts and design documents. When responding to queries:\n1. Prioritize game design theories (MDA, Flow, SDT, Interest Curves) for concept questions\n2. Use UI/UX theory and screen checklists for interface design questions\n3. Reference evaluation criteria and review templates for quality assessment\n4. Use writing guides (GUI, gameplay sections) for document generation\n5. Cross-reference multiple sources when possible\n6. Cite specific theories, principles, or checklist items by name",
        "priority": 10,
        "is_active": True,
        "tags": ["system", "retrieval"],
    })
    if result:
        print("  ✓ Directive created")

    # 4. Push all reference files
    refs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "references")
    print(f"\n[4/4] Pushing {len(FILE_TAGS)} reference files...")

    success = 0
    failed = 0
    for filename, tags in FILE_TAGS.items():
        filepath = os.path.join(refs_dir, filename)
        if not os.path.exists(filepath):
            print(f"  SKIP: {filename} (not found)")
            failed += 1
            continue

        context = FILE_CONTEXT.get(filename, f"Reference file: {filename}")
        doc_id = f"ref-{filename.replace('.md', '').lower()}"

        result = retain_file(filepath, tags, context, doc_id)
        if result:
            success += 1
        else:
            failed += 1

        # Small delay to avoid overwhelming the server
        time.sleep(0.5)

    print(f"\n{'=' * 60}")
    print(f"Done! {success} files pushed, {failed} failed")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
