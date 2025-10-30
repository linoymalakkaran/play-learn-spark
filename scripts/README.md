# Azure Prerequisites Setup

This script creates all necessary Azure resources before running the Terraform GitHub workflow.

## What it creates:

1. **Resource Group** for Terraform state storage
2. **Storage Account** for Terraform remote state
3. **Container** for state files
4. **Service Principal** for GitHub Actions authentication
5. **JWT Secret** for application security

## Prerequisites:

- Azure CLI installed and logged in (`az login`)
- Bash shell (Git Bash on Windows, Terminal on Mac/Linux)
- `jq` command-line tool (for JSON parsing)
- `openssl` (usually pre-installed)

## Usage:

```bash
# Run the setup script
./scripts/setup-azure-prerequisites.sh
```

## Output:

The script will output all the GitHub Secrets you need to copy to your repository:
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET` 
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`
- `TF_STATE_RG`
- `TF_STATE_SA`
- `JWT_SECRET`
- `GOOGLE_AI_API_KEY`

## After running:

1. Copy all secrets to GitHub Repository Settings → Secrets and variables → Actions
2. Optionally set up MongoDB Atlas FREE cluster
3. Run the "Terraform Infra" GitHub workflow with action=plan
4. Review the plan, then run again with action=apply

## Cost:

- Storage Account: ~$0.50/month (for Terraform state only)
- Service Principal: FREE

Total: ~$0.50/month for prerequisites