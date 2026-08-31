# GitHub Actions Deployment for Self-Hosted Supabase

This document explains how to set up automatic deployment of Edge Functions to your self-hosted Supabase instance using GitHub Actions.

## Required GitHub Repository Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** and add the following:

### Server Connection (for Edge Functions deployment)
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SUPABASE_SERVER_HOST` | Hostname or IP of your self-hosted server | `your-server.com` or `192.168.1.100` |
| `SUPABASE_SERVER_USER` | SSH username for the server | `ubuntu` or `root` |
| `SUPABASE_SERVER_SSH_KEY` | Private SSH key (RSA/Ed25519) for passwordless login | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SUPABASE_PROJECT_PATH` | Absolute path to your Supabase project on the server | `/home/ubuntu/supabase-project` |

## How It Works

### Edge Functions Deployment
1. **SCP Copy**: Function directories from `supabase/functions/` are copied to the server's `volumes/functions/`
2. **Service Restart**: The `functions` service is restarted via `sh run.sh restart functions` to pick up new code

## Workflow Triggers

The workflow runs on:
- **Push to `main` branch** when files in `supabase/functions/` are modified
- **Manual trigger** via GitHub Actions UI (`workflow_dispatch`)

## Server-Side Prerequisites

### 1. SSH Key Setup
On your local machine, generate an SSH key pair for GitHub Actions:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_deploy -N ""
```

Add the **public key** to your server's `~/.ssh/authorized_keys`:
```bash
cat ~/.ssh/github_actions_deploy.pub | ssh user@your-server "cat >> ~/.ssh/authorized_keys"
```

Add the **private key** to GitHub Secrets as `SUPABASE_SERVER_SSH_KEY`.

### 2. Firewall/Network
Ensure the GitHub Actions runners can reach:
- **SSH (port 22)** for function deployment

Consider using a VPN or restricting to GitHub's IP ranges for security.

## Testing Locally

Before pushing, test your functions locally:
```bash
supabase functions serve process-image-job
```

## Troubleshooting

### Functions not updating
- Ensure `sh run.sh restart functions` runs successfully
- Check Docker logs: `docker compose logs functions`
- Verify file permissions on `volumes/functions/`

### SSH connection issues
- Verify SSH key format (no extra newlines in secret)
- Check server's `sshd_config` allows key authentication
- Test manually: `ssh -i keyfile user@host`

## Security Best Practices

1. **Use dedicated deployment user** with minimal permissions
2. **Rotate SSH keys** periodically
3. **Use GitHub Environments** for production deployments with required reviewers
4. **Audit workflow runs** regularly for unauthorized changes

## File Structure Reference

```
supabase/
├── config.toml
├── functions/
│   └── process-image-job/
│       ├── index.ts
│       └── providers.ts
└── migrations/
    ├── 20260829160652_create_jobs_table.sql
    └── 20260829161220_create_storage_buckets.sql
```