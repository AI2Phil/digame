#!/bin/bash

# Fix all lowercase UI component imports to proper casing
echo "Fixing UI component import casing..."

# Define the files and their replacements
declare -A replacements=(
    ["../ui/card"]="../ui/Card"
    ["../ui/button"]="../ui/Button"
    ["../ui/badge"]="../ui/Badge"
    ["../ui/progress"]="../ui/Progress"
    ["../ui/input"]="../ui/Input"
    ["../ui/label"]="../ui/Label"
    ["../ui/textarea"]="../ui/Textarea"
    ["../ui/tabs"]="../ui/Tabs"
    ["../ui/select"]="../ui/Select"
    ["../ui/switch"]="../ui/Switch"
)

# Find all .jsx files in frontend/src and fix imports
find frontend/src -name "*.jsx" -type f | while read file; do
    echo "Processing: $file"
    for old in "${!replacements[@]}"; do
        new="${replacements[$old]}"
        # Use sed to replace the imports
        sed -i.bak "s|from '$old'|from '$new'|g" "$file"
        sed -i.bak "s|from \"$old\"|from \"$new\"|g" "$file"
    done
    # Remove backup files
    rm -f "$file.bak"
done

echo "Import casing fixes completed!"