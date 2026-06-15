#!/bin/bash

# Function to add base import and fix links in a file
fix_file() {
    local file="$1"
    
    # Check if file already has base import
    if ! grep -q "const base = import.meta.env.BASE_URL;" "$file"; then
        # Add base import after the first import statement
        sed -i '/^import /a const base = import.meta.env.BASE_URL;' "$file"
    fi
    
    # Replace internal links with base-aware versions
    sed -i "s|href=\"/portfolio_my/|href={\`\${base}|g" "$file"
    sed -i "s|href=\"/projects/|href={\`\${base}projects/|g" "$file"
    sed -i "s|href=\"/about/|href={\`\${base}about/|g" "$file"
    sed -i "s|href=\"/skills/|href={\`\${base}skills/|g" "$file"
    sed -i "s|href=\"/consulting/|href={\`\${base}consulting/|g" "$file"
    sed -i "s|href=\"/contact/|href={\`\${base}contact/|g" "$file"
    sed -i "s|href=\"/\"|href={base}|g" "$file"
    
    # Fix closing quotes for template literals
    sed -i 's|}\"/|}\`/|g' "$file"
    sed -i 's|}\" class=|}` class=|g' "$file"
    sed -i 's|}\" >|}` >|g' "$file"
    
    echo "Fixed: $file"
}

# Fix all project detail pages
for project_file in src/pages/projects/*.astro; do
    if [ "$project_file" != "src/pages/projects/index.astro" ]; then
        fix_file "$project_file"
    fi
done

# Fix other pages
fix_file "src/pages/projects/index.astro"
fix_file "src/pages/about.astro"
fix_file "src/pages/skills.astro"
fix_file "src/pages/consulting.astro"
fix_file "src/pages/contact.astro"

echo "All files fixed!"
