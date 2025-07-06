#!/bin/bash

# Comprehensive UI component import casing fix script
echo "Fixing all UI component import casing issues..."

# Counter for tracking fixes
total_files=0
total_fixes=0

# Function to fix imports in a file
fix_imports_in_file() {
    local file="$1"
    local file_fixes=0
    
    # Create a temporary file for processing
    local temp_file=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
        # Check for import statements with lowercase UI components
        if [[ $line =~ from[[:space:]]*[\'\"]\.\./ui/[a-z] ]] || [[ $line =~ from[[:space:]]*[\'\"]\./ui/[a-z] ]]; then
            # Apply replacements
            line=$(echo "$line" | sed 's|from '\''../ui/card'\''|from '\''../ui/Card'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/card"|from "../ui/Card"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/button'\''|from '\''../ui/Button'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/button"|from "../ui/Button"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/badge'\''|from '\''../ui/Badge'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/badge"|from "../ui/Badge"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/progress'\''|from '\''../ui/Progress'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/progress"|from "../ui/Progress"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/input'\''|from '\''../ui/Input'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/input"|from "../ui/Input"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/label'\''|from '\''../ui/Label'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/label"|from "../ui/Label"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/textarea'\''|from '\''../ui/Textarea'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/textarea"|from "../ui/Textarea"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/tabs'\''|from '\''../ui/Tabs'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/tabs"|from "../ui/Tabs"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/select'\''|from '\''../ui/Select'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/select"|from "../ui/Select"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/switch'\''|from '\''../ui/Switch'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/switch"|from "../ui/Switch"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/accordion'\''|from '\''../ui/Accordion'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/accordion"|from "../ui/Accordion"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/alert'\''|from '\''../ui/Alert'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/alert"|from "../ui/Alert"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/avatar'\''|from '\''../ui/Avatar'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/avatar"|from "../ui/Avatar"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/breadcrumb'\''|from '\''../ui/Breadcrumb'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/breadcrumb"|from "../ui/Breadcrumb"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/calendar'\''|from '\''../ui/Calendar'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/calendar"|from "../ui/Calendar"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/checkbox'\''|from '\''../ui/Checkbox'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/checkbox"|from "../ui/Checkbox"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/dialog'\''|from '\''../ui/Dialog'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/dialog"|from "../ui/Dialog"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/dropdown'\''|from '\''../ui/Dropdown'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/dropdown"|from "../ui/Dropdown"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/form'\''|from '\''../ui/Form'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/form"|from "../ui/Form"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/popover'\''|from '\''../ui/Popover'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/popover"|from "../ui/Popover"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/separator'\''|from '\''../ui/Separator'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/separator"|from "../ui/Separator"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/sheet'\''|from '\''../ui/Sheet'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/sheet"|from "../ui/Sheet"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/skeleton'\''|from '\''../ui/Skeleton'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/skeleton"|from "../ui/Skeleton"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/slider'\''|from '\''../ui/Slider'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/slider"|from "../ui/Slider"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/table'\''|from '\''../ui/Table'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/table"|from "../ui/Table"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/toast'\''|from '\''../ui/Toast'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/toast"|from "../ui/Toast"|g')
            line=$(echo "$line" | sed 's|from '\''../ui/tooltip'\''|from '\''../ui/Tooltip'\''|g')
            line=$(echo "$line" | sed 's|from "../ui/tooltip"|from "../ui/Tooltip"|g')
            
            # Same for ./ui/ paths
            line=$(echo "$line" | sed 's|from '\''./ui/card'\''|from '\''./ui/Card'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/card"|from "./ui/Card"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/button'\''|from '\''./ui/Button'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/button"|from "./ui/Button"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/badge'\''|from '\''./ui/Badge'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/badge"|from "./ui/Badge"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/progress'\''|from '\''./ui/Progress'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/progress"|from "./ui/Progress"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/input'\''|from '\''./ui/Input'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/input"|from "./ui/Input"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/label'\''|from '\''./ui/Label'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/label"|from "./ui/Label"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/textarea'\''|from '\''./ui/Textarea'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/textarea"|from "./ui/Textarea"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/tabs'\''|from '\''./ui/Tabs'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/tabs"|from "./ui/Tabs"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/select'\''|from '\''./ui/Select'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/select"|from "./ui/Select"|g')
            line=$(echo "$line" | sed 's|from '\''./ui/switch'\''|from '\''./ui/Switch'\''|g')
            line=$(echo "$line" | sed 's|from "./ui/switch"|from "./ui/Switch"|g')
            
            ((file_fixes++))
        fi
        
        echo "$line" >> "$temp_file"
    done < "$file"
    
    # Replace original file if changes were made
    if [ $file_fixes -gt 0 ]; then
        mv "$temp_file" "$file"
        echo "  → Fixed $file_fixes imports in $file"
        ((total_fixes += file_fixes))
    else
        rm "$temp_file"
    fi
    
    return $file_fixes
}

# Find all .jsx, .tsx, and .js files in frontend/src and fix imports
find frontend/src -name "*.jsx" -o -name "*.tsx" -o -name "*.js" | while read file; do
    echo "Processing: $file"
    fix_imports_in_file "$file"
    ((total_files++))
done

echo ""
echo "Import casing fixes completed!"
echo "Processed files and applied fixes"
echo ""
echo "Running verification..."

# Verify the fixes by checking for remaining lowercase imports
echo "Checking for remaining lowercase UI imports..."
remaining_files=$(find frontend/src -name "*.jsx" -o -name "*.tsx" -o -name "*.js" | xargs grep -l "from ['\"][./]*ui/[a-z]" 2>/dev/null)

if [ -z "$remaining_files" ]; then
    echo "✅ All UI component imports have been fixed!"
else
    echo "⚠️  Found files with remaining lowercase imports:"
    echo "$remaining_files"
    echo ""
    echo "Showing specific lines that need fixing:"
    find frontend/src -name "*.jsx" -o -name "*.tsx" -o -name "*.js" | xargs grep -n "from ['\"][./]*ui/[a-z]" 2>/dev/null
fi

echo ""
echo "Script execution completed!"