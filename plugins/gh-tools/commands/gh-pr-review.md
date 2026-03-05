Please review the GitHub Pull Request: $ARGUMENTS.

Follow these steps:

# ANALYZE
1. Use `gh pr view` to get the PR details
2. Use `gh pr diff` to see the changes
3. Check the PR description and linked issues
4. Understand the scope and purpose of the changes

# UNDERSTAND
5. Review the files changed and their impact
6. Check if the changes align with the PR description
7. Identify potential breaking changes
8. Look for any missing documentation updates
9. Verify that the changes follow coding standards

# REVIEW
10. Check code quality and best practices
11. Look for potential security issues
12. Verify error handling and edge cases
13. Check for proper testing coverage
14. Review performance implications
15. Ensure consistent coding style

# TEST
16. Pull the branch locally if needed: `gh pr checkout <pr-number>`
17. Run the test suite to ensure all tests pass
18. Test the functionality manually if applicable
19. Verify that existing functionality isn't broken
20. Check if new tests are needed for the changes

# FEEDBACK
21. Use `gh pr comment` to provide feedback on specific lines
22. Request changes if issues are found: `gh pr review --request-changes`
23. Approve the PR if everything looks good: `gh pr review --approve`
24. Suggest improvements or ask questions as needed

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.

## Review Checklist

### 1. Code Quality
- [ ] Code follows project conventions and style
- [ ] Proper error handling and exception management
- [ ] No code duplication or redundant logic
- [ ] Clear variable and function naming
- [ ] Adequate comments where necessary

### 2. Architecture & Design
- [ ] Changes align with existing architecture
- [ ] Proper separation of concerns
- [ ] Interface design is clean and extensible
- [ ] No violation of SOLID principles

### 3. Performance
- [ ] No obvious performance bottlenecks
- [ ] Memory usage considerations
- [ ] Scalability implications assessed
- [ ] Resource management (connections, file handles, etc.)

### 4. Security
- [ ] No security vulnerabilities introduced
- [ ] Input validation where required
- [ ] Sensitive data handling (if applicable)
- [ ] Authentication/authorization considerations

### 5. Testing
- [ ] Unit tests added/updated for new functionality
- [ ] Integration tests considered
- [ ] Edge cases covered
- [ ] Test coverage maintained or improved

### 6. Configuration & Dependencies
- [ ] Configuration changes documented
- [ ] New dependencies justified and secure
- [ ] Environment compatibility maintained
- [ ] Migration path clear (if applicable)

### 7. Documentation
- [ ] Code changes documented appropriately
- [ ] API changes documented
- [ ] README updates if needed
- [ ] Breaking changes highlighted

## Review Comment Template

```markdown
## Code Review Summary

### Overall Assessment
[APPROVE / REQUEST CHANGES / COMMENT]

### Strengths
-

### Areas for Improvement
-

### Critical Issues
-

### Minor Issues
-

### Suggestions
-

### Testing Recommendations
-

### Deployment Considerations
-

### Conclusion
[Summary and final recommendation]
```

## Common Issues to Watch For

### Python Specific
- Import order and organization
- Exception handling patterns
- Type hints usage
- Async/await proper usage
- Memory leaks in long-running services

### Service Architecture
- Proper logging implementation
- Metrics and monitoring integration
- Configuration management
- Service lifecycle management
- Error propagation

### Database/Storage
- Connection pooling
- Transaction management
- Data migration strategies
- Query optimization

### API Design
- RESTful principles
- Input validation
- Error response formats
- Rate limiting considerations

## Automated Checks to Consider
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Security scans clean
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Performance benchmarks acceptable

## Review Commands Reference

```bash
# View PR details
gh pr view [PR_NUMBER]

# Get PR diff
gh pr diff [PR_NUMBER]

# Check PR status
gh pr status

# Check CI/CD status
gh pr checks [PR_NUMBER]

# Review with approval
gh pr review [PR_NUMBER] --approve --body "LGTM! Great work."

# Review with changes requested
gh pr review [PR_NUMBER] --request-changes --body "Please address the issues mentioned above."

# Review with comment only
gh pr review [PR_NUMBER] --comment --body "Some suggestions for improvement."
```

## Tips for Effective Reviews

1. **Be Constructive**: Focus on the code, not the person
2. **Explain the Why**: Don't just point out issues, explain the reasoning
3. **Provide Examples**: Show how to improve code with concrete examples
4. **Balance Criticism**: Acknowledge good practices alongside issues
5. **Consider Context**: Understand the broader context and requirements
6. **Test Thoroughly**: Actually test the changes when possible
7. **Follow Up**: Check that your feedback is addressed appropriately
8. **Clean Up After**: Switch back to main branch when review is complete

## Cleanup After Review

After completing the PR review:
- Switch back to main branch: `git checkout main` or `git switch main`
- Pull latest changes: `git pull origin main`
- Clean up any temporary branches or test environments
