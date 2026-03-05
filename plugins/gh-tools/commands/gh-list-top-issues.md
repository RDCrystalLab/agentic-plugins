List the top $ARGUMENTS most important open issues from my GitHub project based on their priority labels (priority-1 being highest). For each issue:

1. Show the issue number and title
2. Priority level (priority-1 to priority-5)
3. Repository it belongs to
4. Brief description or summary
5. Why it's important/priority rationale

Format the output clearly with proper separation between issues. If issues don't have priority labels, consider their importance based on impact and urgency.

## Priority Levels:
- **priority-1**: Critical - Immediate impact on core functionality or performance
- **priority-2**: High - Significant improvements or optimizations
- **priority-3**: Medium - Important features or enhancements
- **priority-4**: Low - Nice-to-have improvements
- **priority-5**: Minimal - Future considerations

## Example Command:
```bash
gh search issues --owner USERNAME --state open --limit 100 --json number,title,repository,body,labels,url | \
jq -r '.[] | select(.labels[]? | .name | startswith("priority-")) | . + {priority: (.labels[] | select(.name | startswith("priority-")) | .name | split("-")[1] | tonumber)}' | \
jq -s 'sort_by(.priority) | .[0:NUMBER]'
```
