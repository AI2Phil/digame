#!/bin/bash

# Comprehensive UI component import casing fix script
echo "Fixing all UI component import casing issues..."

# Define comprehensive replacements for all UI components
declare -A replacements=(
    # Basic UI components
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
    
    # Additional UI components from DEBUG.md
    ["../ui/accordion"]="../ui/Accordion"
    ["../ui/alertdialog"]="../ui/AlertDialog"
    ["../ui/alert-dialog"]="../ui/AlertDialog"
    ["../ui/aspectratio"]="../ui/AspectRatio"
    ["../ui/aspect-ratio"]="../ui/AspectRatio"
    ["../ui/avatar"]="../ui/Avatar"
    ["../ui/breadcrumb"]="../ui/Breadcrumb"
    ["../ui/calendar"]="../ui/Calendar"
    ["../ui/carousel"]="../ui/Carousel"
    ["../ui/checkbox"]="../ui/Checkbox"
    ["../ui/code"]="../ui/Code"
    ["../ui/collapsible"]="../ui/Collapsible"
    ["../ui/command"]="../ui/Command"
    ["../ui/contextmenu"]="../ui/ContextMenu"
    ["../ui/context-menu"]="../ui/ContextMenu"
    ["../ui/drawer"]="../ui/Drawer"
    ["../ui/dropdownmenu"]="../ui/DropdownMenu"
    ["../ui/dropdown-menu"]="../ui/DropdownMenu"
    ["../ui/form"]="../ui/Form"
    ["../ui/hovercard"]="../ui/HoverCard"
    ["../ui/hover-card"]="../ui/HoverCard"
    ["../ui/inputotp"]="../ui/InputOTP"
    ["../ui/input-otp"]="../ui/InputOTP"
    ["../ui/menubar"]="../ui/Menubar"
    ["../ui/navigationmenu"]="../ui/NavigationMenu"
    ["../ui/navigation-menu"]="../ui/NavigationMenu"
    ["../ui/popover"]="../ui/Popover"
    ["../ui/radiogroup"]="../ui/RadioGroup"
    ["../ui/radio-group"]="../ui/RadioGroup"
    ["../ui/resizable"]="../ui/Resizable"
    ["../ui/scrollarea"]="../ui/ScrollArea"
    ["../ui/scroll-area"]="../ui/ScrollArea"
    ["../ui/separator"]="../ui/Separator"
    ["../ui/sheet"]="../ui/Sheet"
    ["../ui/sidebar"]="../ui/Sidebar"
    ["../ui/skeleton"]="../ui/Skeleton"
    ["../ui/slider"]="../ui/Slider"
    ["../ui/stepper"]="../ui/Stepper"
    ["../ui/table"]="../ui/Table"
    ["../ui/themetoggle"]="../ui/ThemeToggle"
    ["../ui/theme-toggle"]="../ui/ThemeToggle"
    ["../ui/toast"]="../ui/Toast"
    ["../ui/toaster"]="../ui/Toaster"
    ["../ui/toggle"]="../ui/Toggle"
    ["../ui/togglegroup"]="../ui/ToggleGroup"
    ["../ui/toggle-group"]="../ui/ToggleGroup"
    ["../ui/tooltip"]="../ui/Tooltip"
    
    # Relative path variations
    ["./ui/card"]="./ui/Card"
    ["./ui/button"]="./ui/Button"
    ["./ui/badge"]="./ui/Badge"
    ["./ui/progress"]="./ui/Progress"
    ["./ui/input"]="./ui/Input"
    ["./ui/label"]="./ui/Label"
    ["./ui/textarea"]="./ui/Textarea"
    ["./ui/tabs"]="./ui/Tabs"
    ["./ui/select"]="./ui/Select"
    ["./ui/switch"]="./ui/Switch"
    ["./ui/accordion"]="./ui/Accordion"
    ["./ui/alertdialog"]="./ui/AlertDialog"
    ["./ui/alert-dialog"]="./ui/AlertDialog"
    ["./ui/aspectratio"]="./ui/AspectRatio"
    ["./ui/aspect-ratio"]="./ui/AspectRatio"
    ["./ui/avatar"]="./ui/Avatar"
    ["./ui/breadcrumb"]="./ui/Breadcrumb"
    ["./ui/calendar"]="./ui/Calendar"
    ["./ui/carousel"]="./ui/Carousel"
    ["./ui/checkbox"]="./ui/Checkbox"
    ["./ui/code"]="./ui/Code"
    ["./ui/collapsible"]="./ui/Collapsible"
    ["./ui/command"]="./ui/Command"
    ["./ui/contextmenu"]="./ui/ContextMenu"
    ["./ui/context-menu"]="./ui/ContextMenu"
    ["./ui/drawer"]="./ui/Drawer"
    ["./ui/dropdownmenu"]="./ui/DropdownMenu"
    ["./ui/dropdown-menu"]="./ui/DropdownMenu"
    ["./ui/form"]="./ui/Form"
    ["./ui/hovercard"]="./ui/HoverCard"
    ["./ui/hover-card"]="./ui/HoverCard"
    ["./ui/inputotp"]="./ui/InputOTP"
    ["./ui/input-otp"]="./ui/InputOTP"
    ["./ui/menubar"]="./ui/Menubar"
    ["./ui/navigationmenu"]="./ui/NavigationMenu"
    ["./ui/navigation-menu"]="./ui/NavigationMenu"
    ["./ui/popover"]="./ui/Popover"
    ["./ui/radiogroup"]="./ui/RadioGroup"
    ["./ui/radio-group"]="./ui/RadioGroup"
    ["./ui/resizable"]="./ui/Resizable"
    ["./ui/scrollarea"]="./ui/ScrollArea"
    ["./ui/scroll-area"]="./ui/ScrollArea"
    ["./ui/separator"]="./ui/Separator"
    ["./ui/sheet"]="./ui/Sheet"
    ["./ui/sidebar"]="./ui/Sidebar"
    ["./ui/skeleton"]="./ui/Skeleton"
    ["./ui/slider"]="./ui/Slider"
    ["./ui/stepper"]="./ui/Stepper"
    ["./ui/table"]="./ui/Table"
    ["./ui/themetoggle"]="./ui/ThemeToggle"
    ["./ui/theme-toggle"]="./ui/ThemeToggle"
    ["./ui/toast"]="./ui/Toast"
    ["./ui/toaster"]="./ui/Toaster"
    ["./ui/toggle"]="./ui/Toggle"
    ["./ui/togglegroup"]="./ui/ToggleGroup"
    ["./ui/toggle-group"]="./ui/ToggleGroup"
    ["./ui/tooltip"]="./ui/Tooltip"
)

# Counter for tracking fixes
total_files=0
total_fixes=0

# Find all .jsx, .tsx, and .js files in frontend/src and fix imports
find frontend/src -name "*.jsx" -o -name "*.tsx" -o -name "*.js" | while read file; do
    echo "Processing: $file"
    file_fixes=0
    
    for old in "${!replacements[@]}"; do
        new="${replacements[$old]}"
        
        # Check if the file contains the old import before attempting replacement
        if grep -q "from ['\"]$old['\"]" "$file"; then
            # Use sed to replace the imports
            sed -i.bak "s|from '$old'|from '$new'|g" "$file"
            sed -i.bak "s|from \"$old\"|from \"$new\"|g" "$file"
            ((file_fixes++))
            ((total_fixes++))
        fi
    done
    
    # Remove backup files
    rm -f "$file.bak"
    
    if [ $file_fixes -gt 0 ]; then
        echo "  → Fixed $file_fixes imports in $file"
    fi
    
    ((total_files++))
done

echo ""
echo "Import casing fixes completed!"
echo "Processed $total_files files"
echo "Applied $total_fixes import fixes"
echo ""
echo "Running verification..."

# Verify the fixes by checking for remaining lowercase imports
echo "Checking for remaining lowercase UI imports..."
remaining=$(find frontend/src -name "*.jsx" -o -name "*.tsx" -o -name "*.js" | xargs grep -l "from ['\"][./]*ui/[a-z]" 2>/dev/null | wc -l)

if [ $remaining -eq 0 ]; then
    echo "✅ All UI component imports have been fixed!"
else
    echo "⚠️  Found $remaining files with remaining lowercase imports:"
    find frontend/src -name "*.jsx" -o -name "*.tsx" -o -name "*.js" | xargs grep -l "from ['\"][./]*ui/[a-z]" 2>/dev/null
fi

echo ""
echo "Script execution completed!"