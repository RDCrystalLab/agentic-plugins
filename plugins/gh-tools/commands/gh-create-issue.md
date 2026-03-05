Create a new GitHub issue in the current repository and add it to my GitHub project.

## Instructions:
1. Parse the issue details from my input (title, body, labels)
2. Create the issue in the current repository using `gh issue create`
3. Add the created issue to my GitHub project (number: $PROJECT_NUMBER)
4. Return the created issue URL and confirmation

## Required Information:
- Issue title (required)
- Issue body/description (optional)
- Labels (optional, e.g., bug, enhancement, documentation)
- Priority label (optional, e.g., priority-1 to priority-5)

## Commands to use:
```bash
# Get current repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# Create issue
ISSUE_URL=$(gh issue create --repo $REPO --title "TITLE" --body "BODY" --label "LABELS")

# Add to project
gh project item-add 3 --owner ricky1698 --url $ISSUE_URL
```

## Example usage:
"Create an issue: Add dark mode support to the application. This should include theme switching functionality and persist user preference. Labels: enhancement, priority-3"

## Output format:
- Issue created: #[number] - [title]
- Repository: [repo name]
- URL: [issue URL]
- Added to project: Workspace (Project #3)
- Labels: [list of labels]
