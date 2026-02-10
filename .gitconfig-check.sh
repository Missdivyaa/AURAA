#!/bin/bash
# Script to check and prevent co-authors in git commits
# Run this before committing to ensure no co-authors are added

echo "Checking for co-authors in git configuration..."

# Check for trailer configs
if git config --get trailer.co-authored-by.key > /dev/null 2>&1; then
    echo "WARNING: Found co-authored-by trailer config. Removing..."
    git config --unset-all trailer.co-authored-by.key
fi

# Check for commit templates that might add co-authors
if git config --get commit.template > /dev/null 2>&1; then
    TEMPLATE=$(git config --get commit.template)
    if grep -qi "co-authored\|coauthor" "$TEMPLATE" 2>/dev/null; then
        echo "WARNING: Commit template contains co-author references"
    fi
fi

# Set commit cleanup to strip trailers
git config commit.cleanup strip

echo "Git configuration checked and cleaned."
