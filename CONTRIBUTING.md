# MLOps Studio - Contributing Guide

## Development Setup

### Prerequisites
- Node.js 16+
- Python 3.9+
- Docker & Docker Compose
- AWS CLI v2
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/mlops-studio.git
cd mlops-studio

# Install dependencies
npm install
npm install --workspace=frontend
npm install --workspace=backend

# Start development environment
docker-compose up -d
npm run dev
```

### Project Structure

```
mlops-studio/
├── frontend/          # React UI
├── backend/           # Express API
├── infra/            # Terraform IaC
├── cicd/             # GitHub Actions
├── pipelines/        # Step Functions definitions
├── model-registry/   # MLflow configuration
├── model-serving/    # Inference services
├── monitoring/       # Drift detection
├── docs/             # Documentation
└── docker-compose.yml
```

## Coding Standards

### Frontend (React + TypeScript)
- Use functional components with hooks
- Prop types for all components
- 80-character line limit
- Prettier for formatting

```bash
npm run lint --workspace=frontend
npm run format --workspace=frontend
```

### Backend (Express + TypeScript)
- RESTful API design
- Error handling with consistent response format
- Input validation with Joi
- Logging with Pino

```bash
npm run lint --workspace=backend
npm run format --workspace=backend
npm test --workspace=backend
```

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation
- `infra/description` - Infrastructure changes

### Commit Messages
```
type(scope): subject

body

footer
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore

**Example**:
```
feat(backend): add model promotion endpoint

- Implement POST /models/:id/promote
- Add approval tracking
- Update audit logs

Closes #42
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with meaningful commits
3. Write/update tests
4. Update documentation
5. Create PR with description
6. Pass CI checks (lint, test, build)
7. Code review from 2 maintainers
8. Merge to `develop`

### Release Process

1. Create release PR from `develop` to `main`
2. Update version numbers
3. Update CHANGELOG.md
4. Tag release: `git tag v1.2.0`
5. GitHub Actions auto-deploys to production

## Testing

### Frontend Tests
```bash
npm test --workspace=frontend
# Run in watch mode
npm test --workspace=frontend -- --watch
```

### Backend Tests
```bash
npm test --workspace=backend
# With coverage
npm test --workspace=backend -- --coverage
```

### Integration Tests
```bash
# Start services
docker-compose up -d

# Run tests
npm run test:integration
```

## Documentation

### Code Comments
- Comments explain **why**, not **what**
- JSDoc for public APIs
- Inline comments for complex logic

```typescript
/**
 * Promote model to target environment
 * @param modelId - The model identifier
 * @param targetEnv - Target environment (staging, prod)
 * @returns Promotion result
 */
function promoteModel(modelId: string, targetEnv: string) {
  // Check approval count to ensure governance
  if (approvalsNeeded && approvals.length < approvalsNeeded) {
    throw new Error('Insufficient approvals');
  }
}
```

### Markdown Documentation
- Use relative links
- Include code examples
- Keep sections focused
- Update table of contents

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Memoization with useMemo/useCallback
- Virtual scrolling for large lists
- Image optimization

### Backend
- Database connection pooling
- Response caching with TTL
- Pagination for list endpoints
- Async/await for I/O operations

### Infrastructure
- CloudFront caching for static assets
- RDS read replicas for scaling
- ECS Fargate auto-scaling
- S3 lifecycle policies

## Security Guidelines

### Code Security
- No hardcoded secrets (use Secrets Manager)
- Input validation on all endpoints
- SQL injection protection (use ORMs/parameterized queries)
- CSRF protection for forms
- XSS prevention in templates

### Dependency Management
- Keep dependencies updated: `npm audit`
- Review security advisories
- Use exact versions in package-lock.json
- Rotate credentials regularly

### Deployment Security
- Use IAM roles instead of keys
- Enable MFA for production access
- Encrypt data at rest and in transit
- Regular security audits

## Reporting Issues

### Bug Report
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs

### Feature Request
- Motivation and use case
- Proposed solution
- Alternative approaches
- Related issues

## Questions & Support

- **Slack**: #mlops-studio
- **Email**: mlops-team@org.com
- **Office Hours**: Tuesday & Thursday 2-3 PM PT

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and professional
- Welcome differing opinions
- Focus on constructive feedback
- Report violations to maintainers

---

**Thank you for contributing to MLOps Studio!**
