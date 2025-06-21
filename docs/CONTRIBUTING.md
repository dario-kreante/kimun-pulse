# Contributing Guide

## Workflow
- Fork the repository
- Create a feature branch: `git checkout -b feature/your-feature`
- Commit using Conventional Commits
- Push and create a Pull Request

## Code Standards
- Use TypeScript for all code
- Run ESLint and Prettier before committing
- Write unit and integration tests for new features
- Maintain at least 80% test coverage

## Commit Message Format
```
type(scope): description
```
Example:
```
feat(auth): add user registration endpoint
fix(ui): resolve mobile navigation issue
```

## Branch Naming
- `feature/feature-name`
- `bugfix/bug-description`
- `hotfix/critical-fix`
- `release/version-number` 