# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6dff3069-fa96-4838-a913-9bfce714e283

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6dff3069-fa96-4838-a913-9bfce714e283) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Manual Deployment

Simply open [Lovable](https://lovable.dev/projects/6dff3069-fa96-4838-a913-9bfce714e283) and click on Share -> Publish.

### CI/CD Automated Deployment

This project uses GitHub Actions for continuous integration and deployment. The workflow is configured to:

1. **Lint and Test**: Run code quality checks and tests on every push and pull request
2. **Build**: Create optimized production builds with environment variables
3. **Deploy to Staging**: Automatically deploy to staging environment when changes are pushed to the `develop` branch
4. **Deploy to Production**: Automatically deploy to production when changes are pushed to `main` or `master` branches

#### Required GitHub Secrets

To use the CI/CD pipeline, you need to configure these secrets in your GitHub repository:

- `VITE_DIRECTUS_URL`: URL of your Directus backend
- `VITE_DIRECTUS_TOKEN`: API token for Directus
- `STAGING_HOST`: Hostname of your staging server
- `STAGING_USERNAME`: SSH username for staging server
- `STAGING_SSH_KEY`: SSH private key for staging server
- `STAGING_TARGET_PATH`: Deployment path on staging server
- `PRODUCTION_HOST`: Hostname of your production server
- `PRODUCTION_USERNAME`: SSH username for production server
- `PRODUCTION_SSH_KEY`: SSH private key for production server
- `PRODUCTION_TARGET_PATH`: Deployment path on production server

To add these secrets, go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
