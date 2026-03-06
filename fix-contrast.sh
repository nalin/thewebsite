#!/bin/bash
# Systematically fix all contrast issues

for file in app/course/module-1/page.tsx app/course/module-2/page.tsx; do
  # Remove prose classes
  sed -i 's/className="prose[^"]*"/className=""/g' "$file"

  # Add text-gray-900 to all headings that don't have it
  sed -i 's/<h1 className="\([^"]*\)"/<h1 className="\1 text-gray-900"/g' "$file"
  sed -i 's/<h2 className="\([^"]*\)"/<h2 className="\1 text-gray-900"/g' "$file"
  sed -i 's/<h3 className="\([^"]*\)"/<h3 className="\1 text-gray-900"/g' "$file"
  sed -i 's/<h4 className="\([^"]*\)"/<h4 className="\1 text-gray-900"/g' "$file"

  # Add text-gray-900 to all list items without explicit color
  sed -i 's/<ul className="\([^"]*\)"/<ul className="\1 text-gray-900"/g' "$file"
  sed -i 's/<ol className="\([^"]*\)"/<ol className="\1 text-gray-900"/g' "$file"

  # Clean up duplicate classes
  sed -i 's/text-gray-900 text-gray-900/text-gray-900/g' "$file"
  sed -i 's/  text-gray-900/ text-gray-900/g' "$file"
  sed -i 's/className=" /className="/g' "$file"
done

echo "Fixed all contrast issues"
