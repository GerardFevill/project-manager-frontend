# GitHub Actions Setup

## Required Secrets

To enable the CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

### Settings → Secrets and variables → Actions → New repository secret

1. **DOCKERHUB_USERNAME**
   - Your DockerHub username (e.g., `gerardfevill`)

2. **DOCKERHUB_TOKEN**
   - Your DockerHub access token
   - Create one at: https://hub.docker.com/settings/security
   - Click "New Access Token"
   - Give it a description (e.g., "GitHub Actions")
   - Copy the token and paste it as the secret value

## Workflow Features

The CI/CD pipeline includes:

### Build Job (runs on all pushes and PRs)
- ✅ Checkout code
- ✅ Setup Node.js 22
- ✅ Install dependencies
- ✅ Lint code
- ✅ Build Angular application
- ✅ Run tests
- ✅ Upload build artifacts

### Docker Job (runs only on main branch pushes)
- ✅ Build Docker image
- ✅ Push to DockerHub with tags:
  - `latest`
  - Commit SHA (for versioning)
- ✅ Use build cache for faster builds

## Manual Setup

If you prefer to set up secrets via CLI:

```bash
# Set DockerHub username
gh secret set DOCKERHUB_USERNAME --body "your-dockerhub-username"

# Set DockerHub token (you'll be prompted to paste it)
gh secret set DOCKERHUB_TOKEN
```

## Verify Setup

After configuring secrets, push a commit to trigger the workflow:

```bash
git add .
git commit -m "Configure GitHub Actions"
git push origin main
```

Then check the Actions tab in your repository to see the workflow running.
