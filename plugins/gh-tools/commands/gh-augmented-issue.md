Augmented and create a detailed GitHub issue based on codebase investigation: $ARGUMENTS.

This command creates an Augmented issue by first investigating the current codebase to provide precise, actionable details in the issue body.

Follow these steps:

# INVESTIGATE CODEBASE
1. **Parse the basic issue request** from the input (title, general description)
2. **Search the codebase** for relevant files and patterns:
   - Use `rg` or grep to find related functionality
   - Look for existing implementations or similar features
   - Identify relevant configuration files
   - Find related test files
3. **Analyze project structure**:
   - Check package.json/requirements.txt for dependencies
   - Understand the project's tech stack and patterns
   - Identify coding conventions and architectural patterns
4. **Review existing issues and PRs**:
   - Search for related issues: `gh issue list --search "keyword"`
   - Check closed issues for prior art: `gh issue list --state closed --search "keyword"`
   - Look for related PRs: `gh pr list --search "keyword"`

# AUGMENTED ISSUE DETAILS
5. **Create detailed implementation plan** based on findings:
   - List specific files that need modification
   - Identify dependencies or libraries to use/add
   - Specify exact locations for code changes
   - Include relevant code snippets or examples from codebase
6. **Add technical specifications**:
   - API endpoints to create/modify
   - Database schema changes if needed
   - Configuration changes required
   - Testing approach and files to modify
7. **Include acceptance criteria**:
   - Specific, measurable outcomes
   - Test cases to implement
   - Performance considerations
   - Compatibility requirements

# CREATE AUGMENTED ISSUE
8. **Generate comprehensive issue body** with:
   - Clear problem statement
   - Detailed implementation plan
   - Specific file locations and code references
   - Technical requirements and dependencies
   - Acceptance criteria and test cases
   - Links to related issues/PRs if found
9. **Create the issue** using `gh issue create` with augmented content
10. **Add to project** (number: 3) using `gh project item-add`

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.

## Augmented Issue Template

```markdown
## Problem Statement
[Clear description of the issue/feature request]

## Current State Analysis
[Based on codebase investigation]
- Relevant files found: `path/to/file1.js`, `path/to/file2.js`
- Existing similar functionality: [link or description]
- Current dependencies: [list relevant packages]
- Related issues: #123, #456

## Proposed Solution
### Implementation Plan
1. **Modify existing files:**
   - `path/to/file1.js` - Add function X at line Y
   - `path/to/file2.js` - Update component Z

2. **Create new files:**
   - `path/to/new-file.js` - Implement new functionality

3. **Dependencies:**
   - Add package: `npm install package-name`
   - Update configuration in: `config/app.js`

### Technical Specifications
- API Endpoints:
  - `GET /api/endpoint` - [description]
  - `POST /api/endpoint` - [description]
- Database Changes: [if applicable]
- Configuration: [specific config changes]

## Acceptance Criteria
- [ ] [Specific testable outcome 1]
- [ ] [Specific testable outcome 2]
- [ ] [Performance requirement]
- [ ] [Compatibility requirement]

## Testing Plan
- Unit tests: `tests/unit/feature.test.js`
- Integration tests: `tests/integration/feature.test.js`
- Manual testing steps: [specific steps]

## Additional Context
- Related issues: [links]
- Prior discussions: [links]
- Documentation to update: [file paths]
```

## Investigation Commands Reference

```bash
# Search for relevant code patterns
rg "search_term" --type js --type ts

# Find configuration files
find . -name "*.config.*" -o -name "config.*"

# Check project dependencies
cat package.json | jq '.dependencies'
cat requirements.txt 2>/dev/null || echo "No Python requirements"

# Search existing issues
gh issue list --search "keyword" --limit 10
gh issue list --state closed --search "keyword" --limit 5

# Search related PRs
gh pr list --search "keyword" --limit 10

# Check project structure
tree -I 'node_modules|__pycache__|.git' -L 3

# Find test files
find . -name "*test*" -o -name "*spec*" | grep -v node_modules
```

## Augmented Issue Checklist

### Investigation Complete
- [ ] Searched codebase for related functionality
- [ ] Identified relevant files and code patterns
- [ ] Checked existing issues and PRs
- [ ] Analyzed project structure and dependencies
- [ ] Reviewed coding conventions and patterns

### Augmented Issue
- [ ] Added specific file locations and modifications
- [ ] Included technical specifications
- [ ] Listed exact dependencies and configurations
- [ ] Created detailed acceptance criteria
- [ ] Added comprehensive testing plan
- [ ] Referenced related issues/PRs

### Creation and Organization
- [ ] Created issue with augmented body
- [ ] Applied appropriate labels
- [ ] Added to GitHub project
- [ ] Verified issue URL and access

## Common Investigation Areas

### Frontend Projects
- Component structure and patterns
- State management approach
- Styling/theming system
- Build configuration
- Testing framework setup

### Backend Projects
- API structure and patterns
- Database schema and models
- Authentication/authorization
- Configuration management
- Logging and monitoring

### Full-stack Projects
- Frontend-backend integration patterns
- API contract and documentation
- Deployment configuration
- Environment-specific settings
- End-to-end testing approach

## Tips for Effective Augmented Issue

1. **Be Specific**: Reference exact file paths and line numbers when possible
2. **Use Code Examples**: Include relevant snippets from existing codebase
3. **Link Related Work**: Reference issues, PRs, and discussions
4. **Consider Impact**: Identify all affected areas and potential side effects
5. **Plan Testing**: Be specific about what tests need to be written/updated
6. **Document Dependencies**: List all required packages, tools, or services

## Output Format

After creating the augmented issue:
```
Augmented Issue Created Successfully!

Issue: #[number] - [title]
Repository: [repo name]
URL: [issue URL]
Added to project: Workspace (Project #3)
Labels: [list of labels]

Investigation Summary:
- Files analyzed: [count]
- Related issues found: [count]
- Dependencies identified: [list]
- Implementation complexity: [assessment]
```
