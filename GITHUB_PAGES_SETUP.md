# Deploy to GitHub Pages Setup Guide

## Overview

This GitHub Actions workflow automatically builds and deploys the MLOps Studio frontend to GitHub Pages whenever you push to the `main` branch.

## Prerequisites

1. **GitHub Repository** - Your project must be on GitHub
2. **Repository Visibility** - Public or Private (GitHub Pages works for both with proper settings)
3. **Branch Protection** - `main` branch (optional but recommended)

## Setup Steps

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select `GitHub Actions`
   - Leave other settings as default
4. Click **Save**

### Step 2: Configure Environment Variables (Optional)

If your backend is hosted on a custom URL, add a GitHub secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-api-domain.com/api` (e.g., `https://api.example.com`)
4. Click **Add secret**

> **Note**: If no secret is set, the workflow will use the fallback URL in the YAML file.

### Step 3: Push to Main Branch

```powershell
cd "c:\Users\sajag\Desktop\GIT\ML_Ops_Studio\MLOps-Studio-VS-V1"
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

### Step 4: Check Deployment Status

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Look for the **Deploy Frontend to GitHub Pages** workflow
4. Watch it build and deploy (usually takes 1-2 minutes)
5. Once complete, your site will be live at:
   - `https://YOUR_USERNAME.github.io/REPO_NAME/`

### Step 5: Verify Deployment

1. Go to **Settings** → **Pages**
2. You should see:
   - ✅ "Your site is live at `https://...`"
   - Recent deployments with status indicators

## How It Works

### Workflow Trigger
- Runs on every `push` to `main` branch
- Also runs on pull requests (for preview builds)
- Production deployment only happens on main branch pushes

### Build Process
1. **Checkout**: Downloads your code
2. **Setup Node.js**: Installs Node.js v18
3. **Install Dependencies**: Runs `npm install` in frontend folder
4. **Build**: Runs `npm run build` to generate optimized production files
5. **Upload Artifact**: Uploads `frontend/dist/` to GitHub Pages
6. **Deploy**: Publishes the build to your GitHub Pages site

### Environment Variables
The workflow can access:
- `VITE_API_URL` - Backend API URL (from GitHub Secrets)
- Build environment: `production`

## Customization

### Change Deployment Trigger
Edit `.github/workflows/deploy-to-pages.yml`:

```yaml
on:
  push:
    branches: ["main", "develop"]  # Add more branches
  workflow_dispatch:               # Allow manual trigger
```

### Change Node Version
```yaml
node-version: '18'  # Change to '20' for latest, '16' for older
```

### Change Build Command
```yaml
run: npm run build -- --outDir=docs  # Output to docs/ instead of dist/
```

## Troubleshooting

### Workflow Failed to Run
- Check **Actions** tab for error logs
- Verify repository settings have "GitHub Actions" enabled
- Ensure `.github/workflows/deploy-to-pages.yml` is in main branch

### Build Failed
Common issues:
- **Missing dependencies**: Run `npm install` locally first
- **Environment variables**: Check GitHub Secrets are configured
- **TypeScript errors**: Fix compilation errors in `npm run build`

### Pages Not Updating
- Clear browser cache (Ctrl+Shift+Del)
- Wait 2-3 minutes for deployment to complete
- Check that workflow shows ✅ success status

### API Calls Fail from GitHub Pages
- Ensure `VITE_API_URL` is configured in GitHub Secrets
- Check backend CORS settings allow your GitHub Pages domain
- Verify backend is publicly accessible

## CORS Configuration for Backend

Your backend must allow requests from your GitHub Pages domain:

```javascript
// Example: Express.js backend
const cors = require('cors');
app.use(cors({
  origin: [
    'https://YOUR_USERNAME.github.io',
    'http://localhost:3000'  // Local development
  ]
}));
```

## Advanced: Custom Domain

To use a custom domain with GitHub Pages:

1. Update DNS records (CNAME or A records)
2. Go to **Settings** → **Pages**
3. Under "Custom domain", enter your domain
4. Commit the generated `CNAME` file

See [GitHub Pages Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## Monitoring Deployments

### Via GitHub UI
1. Repository → **Actions** tab
2. Find **Deploy Frontend to GitHub Pages** workflow
3. Click to see build logs and status

### Via Command Line
```powershell
# View recent workflow runs
gh run list --workflow deploy-to-pages.yml

# View specific run details
gh run view <run-id>

# View logs
gh run view <run-id> --log
```

## Disable Workflow

To temporarily disable auto-deployment:

1. Go to **Actions** tab
2. Find **Deploy Frontend to GitHub Pages**
3. Click **...** → **Disable workflow**

Re-enable by clicking **Enable workflow** when ready.

## Performance Notes

- Initial build: ~2-3 minutes
- Subsequent builds: ~1-2 minutes (with caching)
- Files cached: `node_modules/` directory
- Deployments are atomic (all-or-nothing)

## Security Considerations

1. **API Keys**: Never commit API keys to source code
2. **Use GitHub Secrets**: Store sensitive data in Settings → Secrets
3. **Environment Files**: `.env` files should be in `.gitignore`
4. **CORS Headers**: Configure on backend to restrict access

## Next Steps

1. ✅ Setup GitHub Pages in Settings
2. ✅ Push code to main branch
3. ✅ Monitor first deployment in Actions tab
4. ✅ Verify site is live at GitHub Pages URL
5. ✅ (Optional) Configure custom domain
6. ✅ (Optional) Add API URL secret for backend integration

---

**Example GitHub Pages URLs**:
- `https://sajagthakare.github.io/MLOps-Studio/`
- `https://your-username.github.io/your-repo-name/`

**Ready to deploy?** Push to main and watch the magic happen! 🚀
