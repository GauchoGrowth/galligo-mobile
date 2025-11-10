Back up all Claude Code assets to a single flat directory on the Desktop.

**Requirements:**
- Create timestamped directory: `~/Desktop/Claude-code-{YYYY-MM-DD-HHmmss}/`
- Copy ALL files into ONE flat directory (no subdirectories)
- Set proper permissions and force Finder refresh

**Execute this bash script:**

```bash
#!/bin/bash

# Generate timestamp
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
BACKUP_DIR="$HOME/Desktop/Claude-code-$TIMESTAMP"

echo "🔍 Searching for Claude assets..."
mkdir -p "$BACKUP_DIR"
echo "✅ Created: $BACKUP_DIR"

# Copy CLAUDE.md from root
if [ -f "CLAUDE.md" ]; then
    cp "CLAUDE.md" "$BACKUP_DIR/"
    echo "✅ Copied CLAUDE.md"
fi

# Copy all .claude/agents/*.md files directly to root
if [ -d ".claude/agents" ]; then
    for file in .claude/agents/*.md; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            echo "✅ Copied $(basename "$file")"
        fi
    done
fi

# Copy all .claude/skills/*.md files directly to root
if [ -d ".claude/skills" ]; then
    for file in .claude/skills/*.md; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            echo "✅ Copied $(basename "$file")"
        fi
    done
fi

# Copy all .claude/commands/*.md files directly to root
if [ -d ".claude/commands" ]; then
    for file in .claude/commands/*.md; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            echo "✅ Copied $(basename "$file")"
        fi
    done
fi

# Copy settings.local.json directly to root
if [ -f ".claude/settings.local.json" ]; then
    cp ".claude/settings.local.json" "$BACKUP_DIR/"
    echo "✅ Copied settings.local.json"
fi

# Copy MCP config directly to root (rename to mcp-config.json)
if [ -f ".claude/.mcp.json" ]; then
    cp ".claude/.mcp.json" "$BACKUP_DIR/mcp-config.json"
    echo "✅ Copied mcp-config.json"
elif [ -f ".claude/mcp.json" ]; then
    cp ".claude/mcp.json" "$BACKUP_DIR/mcp-config.json"
    echo "✅ Copied mcp-config.json"
fi

# Copy all docs/*.md files directly to root
if [ -d "docs" ]; then
    for file in docs/*.md; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/"
            echo "✅ Copied $(basename "$file")"
        fi
    done
fi

# Set permissions (critical for Finder visibility)
chmod -R 755 "$BACKUP_DIR"

# Remove .DS_Store files (prevents Finder cache issues)
find "$BACKUP_DIR" -name ".DS_Store" -delete 2>/dev/null

# Count files
TOTAL_FILES=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')

echo ""
echo "✨ Backup complete!"
echo "📍 Location: $BACKUP_DIR"
echo "📊 Total files: $TOTAL_FILES"
echo ""
echo "📂 All files in one directory:"
ls -1 "$BACKUP_DIR"

# Force Finder refresh (critical for visibility)
killall Finder 2>/dev/null

echo ""
echo "🎉 All Claude assets are in one flat directory - ready to copy!"
```
