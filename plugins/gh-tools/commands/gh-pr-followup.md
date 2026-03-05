Follow up on GitHub Pull Request review feedback: $ARGUMENTS.

After a PR review has been completed and changes are requested, use this to systematically address all feedback and rework the PR.

Follow these steps:

# ANALYZE FEEDBACK
1. **FIRST**: Checkout the PR branch locally: `gh pr checkout [PR_NUMBER]`
2. Verify you're on the correct branch: `git branch --show-current`
3. Use `gh pr view` to see the current PR status and review comments
4. Use `gh pr reviews` to get detailed review feedback
5. Identify all requested changes and categorize them:
   - Critical issues that must be fixed
   - Suggestions for improvement
   - Questions that need clarification
6. Check if any automated checks are failing

# UNDERSTAND REQUIREMENTS
7. Review each comment and understand the reasoning behind the feedback
8. Ask for clarification if any feedback is unclear
9. Prioritize changes based on impact and reviewer emphasis
10. Identify any potential conflicts between different reviewers' feedback

# PLAN REWORK
11. Create a comprehensive plan addressing all feedback:
    - Break down changes into logical, manageable tasks
    - Determine the order of implementation
    - Identify any additional testing needed
    - Consider documentation updates required
12. Estimate effort and timeline for each change

# IMPLEMENT CHANGES
13. **VERIFY BRANCH**: Double-check you're still on the correct PR branch: `git branch --show-current`
14. Pull latest changes from remote if needed: `git pull origin [branch-name]`
15. Create commits that clearly address specific feedback:
    - Reference review comments in commit messages
    - Group related changes logically
    - Maintain clean, reviewable commit history
16. For each major change:
    - Implement the fix/improvement
    - Add or update tests as needed
    - Update documentation if applicable
    - Verify the change works as expected

# TEST THOROUGHLY
17. Run the full test suite to ensure no regressions
18. Test the specific functionality that was changed
19. Verify that all automated checks now pass
20. If UI changes were made, test across different browsers/devices
21. Performance test if changes could impact performance

# RESPOND TO FEEDBACK
22. Use `gh pr comment` to respond to each review comment:
    - Explain how you addressed the feedback
    - Mark conversations as resolved when appropriate
    - Ask follow-up questions if needed
23. Update the PR description if significant changes were made
24. Add a summary comment explaining all changes made

# REQUEST RE-REVIEW
25. Push all changes to the remote branch: `git push origin [branch-name]`
26. Use `gh pr ready` if the PR was in draft mode
27. Request re-review from the original reviewers
28. Tag specific reviewers for critical changes if needed
29. Provide a clear summary of what was changed

# CLEANUP
30. Switch back to main branch: `git checkout main` or `git switch main`
31. Pull latest changes: `git pull origin main`
32. Clean up local workspace if needed

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.

## Rework Checklist

### Addressing Feedback
- [ ] All critical issues have been resolved
- [ ] Code quality suggestions have been implemented
- [ ] Security concerns have been addressed
- [ ] Performance issues have been fixed
- [ ] Testing gaps have been filled
- [ ] Documentation has been updated

### Code Changes
- [ ] Changes are logically organized in commits
- [ ] Commit messages reference specific feedback
- [ ] No unrelated changes have been introduced
- [ ] Code follows project conventions consistently
- [ ] All new code is properly tested

### Communication
- [ ] Responded to all review comments appropriately
- [ ] Marked resolved conversations as resolved
- [ ] Updated PR description with significant changes
- [ ] Provided clear summary of rework

### Verification
- [ ] All tests pass locally
- [ ] All automated checks pass
- [ ] Manual testing completed for changed functionality
- [ ] No regressions introduced
- [ ] Performance impact assessed

### Cleanup
- [ ] Pushed all changes to remote branch
- [ ] Requested re-review from appropriate reviewers
- [ ] Switched back to main branch
- [ ] Pulled latest changes from main

## Response Templates

### Addressing Feedback Comment
```markdown
Thanks for the feedback! I've addressed this by:

[Specific changes made]

The changes are in commit [commit-hash]. Please let me know if this addresses your concern or if you'd like me to adjust anything else.
```

### Summary Comment Template
```markdown
## Rework Summary

Thanks for the thorough review! I've addressed all the feedback:

### Critical Issues Fixed
- [Issue 1]: [How it was fixed]
- [Issue 2]: [How it was fixed]

### Improvements Made
- [Improvement 1]: [What was changed]
- [Improvement 2]: [What was changed]

### Additional Changes
- [Additional change 1]
- [Additional change 2]

### Testing
- [Testing approach for changes]
- All tests pass
- Manual testing completed

The PR is now ready for re-review. Please let me know if anything else needs to be adjusted!
```

## Rework Commands Reference

```bash
# CRITICAL: First checkout the PR branch
gh pr checkout [PR_NUMBER]

# Verify you're on the correct branch
git branch --show-current

# View current PR status
gh pr view [PR_NUMBER]

# Get all review comments
gh pr reviews [PR_NUMBER]

# Respond to specific comment
gh pr comment [PR_NUMBER] --body "Response message"

# Check PR checks status
gh pr checks [PR_NUMBER]

# Mark PR as ready for review (if was draft)
gh pr ready [PR_NUMBER]

# Request specific reviewers
gh pr edit [PR_NUMBER] --add-reviewer username1,username2

# Update PR description
gh pr edit [PR_NUMBER] --body "Updated description"

# Switch back to main branch when done
git checkout main
git pull origin main
```

## Tips for Effective Rework

1. **Always Start with Branch Checkout**: First thing - `gh pr checkout [PR_NUMBER]`
2. **Verify Branch Before Every Session**: `git branch --show-current` to confirm
3. **Address All Feedback**: Don't cherry-pick - address every comment
4. **Communicate Clearly**: Explain your changes and reasoning
5. **Test Thoroughly**: Ensure changes work and don't break anything
6. **Stay Organized**: Keep commits logical and well-documented
7. **Be Responsive**: Respond promptly to reviewer questions
8. **Learn and Improve**: Use feedback to improve future code quality
9. **Follow Up**: Check that reviewers are satisfied with changes
10. **Clean Up After**: Always switch back to main branch when done
