# Contributing to Loopletter

We love your input! We want to make contributing to Loopletter as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Getting Started

1. Fork the repo and clone your fork locally
2. Add the upstream repository as a remote: `git remote add upstream https://github.com/yourusername/loopletter.git`
3. Create a new branch from `main` for your feature or fix: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [README.md](README.md)

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your local configuration

# Run the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Code Style

- We use TypeScript for type safety
- Follow the existing code patterns and structure
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Testing

While we currently have limited automated tests, please:
- Test your changes manually in the development environment
- Test both happy paths and edge cases
- Include test scripts where applicable (see `scripts/` directory)

### Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly
3. Commit with clear, descriptive messages:
   ```bash
   git commit -m "Add feature: description of what was added"
   git commit -m "Fix: description of what was fixed"
   git commit -m "Refactor: description of what was refactored"
   ```

### Submitting Changes

1. Push your branch to your fork: `git push origin feature/your-feature-name`
2. Open a pull request against `main` in the main repository
3. In the PR description, please include:
   - What problem does this solve or what feature does it add?
   - How have you tested this?
   - Any breaking changes?
   - Screenshots (if UI changes)

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

**Great Bug Reports** typically have:
- A quick summary and/or background
- Steps to reproduce (be specific!)
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)
- Your environment (OS, Node version, etc.)

## Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues with the `enhancement` label.

When creating an enhancement suggestion, please include:
- Use case and motivation
- Detailed description of the proposed feature
- Examples of how it would work
- Possible drawbacks or alternatives

## Setting Up External Services

For local development, you may need to configure:

### Supabase
- Create a free project at [supabase.com](https://supabase.com)
- Copy connection details to `.env.local`
- Apply database migrations (see [SERVICES.md](docs/SERVICES.md))

### Clerk
- Create a free account at [clerk.com](https://clerk.com)
- Create an application
- Copy the keys to `.env.local`

### AWS SES (for email testing)
- Create an AWS account
- Set up SES in your region
- Copy credentials to `.env.local`

See [docs/SERVICES.md](docs/SERVICES.md) for detailed setup instructions.

## Pull Request Process

1. Update documentation as needed
2. Add meaningful commit messages
3. Update the README.md with details of any new environment variables, ports used, or new features
4. The PR will be reviewed by maintainers
5. Address any feedback or changes requested
6. Once approved, your PR will be merged

## Coding Standards

### TypeScript
- Use strict mode
- Avoid `any` types when possible
- Use interfaces for component props

### React
- Use functional components and hooks
- Keep components focused and small
- Use meaningful component names

### Database
- Use meaningful table and column names
- Include timestamps (`created_at`, `updated_at`)
- Add appropriate indexes for performance
- Include foreign key constraints

## Questions?

Feel free to open a discussion on GitHub or file an issue with the `question` label.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Attribution

This contributing guide was adapted from best practices in open source communities.

---

Thank you for contributing to Loopletter! 🎵
