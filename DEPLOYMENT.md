# AWS Deployment Guide (Browser-Based)

This guide shows you how to deploy your Dockerized Todo App to AWS using **only the AWS Console** (no command line automation needed). Perfect for teaching and demonstrations!

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Steps](#deployment-steps)
3. [Testing Your Deployment](#testing-your-deployment)
4. [Troubleshooting](#troubleshooting)
5. [Cleanup (Important!)](#cleanup-important)

---

## Prerequisites

- AWS Account (free tier eligible)
- Your GitHub/GitLab repository URL (or be ready to copy-paste your code)
- 30-45 minutes

> 💡 **Tip**: Use the free tier! This deployment uses t2.micro (free tier eligible).

---

## Deployment Steps

Deploy everything on one EC2 instance using Docker Compose - exactly like local development!

### Step 1: Launch an EC2 Instance

1. **Go to AWS Console**: https://console.aws.amazon.com/
2. **Navigate to EC2**: Type "EC2" in the search bar
3. **Click "Launch Instance"** (big orange button)

4. **Configure the instance:**

   **Name and tags:**
   - Name: `todo-app-server`

   **Application and OS Images (Amazon Machine Image):**
   - Select: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
   - Architecture: **64-bit (x86)**
   - ✅ Free tier eligible

   **Instance type:**
   - Select: **t2.micro** (Free tier eligible)
   - Note: For production or larger classes, use t3.small

   **Key pair (login):**
   - Click "Create new key pair"
   - Key pair name: `todo-app-key`
   - Key pair type: **RSA**
   - Private key file format: **`.pem`** (Mac/Linux) or **`.ppk`** (Windows/PuTTY)
   - Click **"Create key pair"**
   - 💾 **IMPORTANT**: Save this file! You'll need it to connect.

   **Network settings:**
   - Click "Edit" button
   - **Auto-assign public IP**: Enable
   
   **Firewall (security groups):**
   - Select: **Create security group**
   - Security group name: `todo-app-sg`
   - Description: `Security group for todo app`
   
   Add these rules (click "Add security group rule" for each):
   
   | Type | Protocol | Port Range | Source | Description |
   |------|----------|------------|--------|-------------|
   | SSH | TCP | 22 | My IP | SSH access |
   | Custom TCP | TCP | 3000 | Anywhere (0.0.0.0/0) | Backend API |
   | Custom TCP | TCP | 5432 | My IP | PostgreSQL (optional) |

   > ⚠️ **Security Note**: For production, restrict port 3000 to specific IPs or use a load balancer.

   **Configure storage:**
   - **20 GiB** gp3 (default is fine)
   - Root volume will be deleted on termination (default is fine)

5. **Advanced details** (scroll down, optional but recommended):
   
   In the **User data** text box, paste this script to auto-install Docker:

   ```bash
   #!/bin/bash
   # Update system
   apt-get update -y
   apt-get upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose

   # Add ubuntu user to docker group
   usermod -aG docker ubuntu

   # Install git
   apt-get install -y git

   echo "Setup complete!" > /home/ubuntu/setup-done.txt
   ```

6. **Review and Launch:**
   - Review your settings in the Summary panel
   - Click **"Launch instance"** (orange button)
   - Wait 2-3 minutes for instance to initialize

### Step 2: Connect to Your Instance

1. **Find your instance:**
   - Go back to EC2 Dashboard
   - Click "Instances" in left sidebar
   - Find your `todo-app-server` instance
   - Wait until **Instance state** = Running and **Status check** = 2/2 checks passed

2. **Get connection info:**
   - Click the checkbox next to your instance
   - Click **"Connect"** button at the top
   - Go to **"SSH client"** tab
   - Copy the example command (looks like):
     ```bash
     ssh -i "todo-app-key.pem" ubuntu@ec2-XX-XXX-XXX-XXX.compute-1.amazonaws.com
     ```

3. **Connect using Terminal/Command Prompt:**

   **Mac/Linux:**
   ```bash
   # Navigate to where you downloaded the .pem file
   cd ~/Downloads
   
   # Set correct permissions
   chmod 400 todo-app-key.pem
   
   # Connect
   ssh -i "todo-app-key.pem" ubuntu@your-ec2-public-dns
   ```

   **Windows (PowerShell):**
   ```powershell
   # Navigate to downloads
   cd $HOME\Downloads
   
   # Connect
   ssh -i "todo-app-key.pem" ubuntu@your-ec2-public-dns
   ```

   **Windows (PuTTY):**
   - Open PuTTY
   - Host Name: `ubuntu@your-ec2-public-dns`
   - Connection > SSH > Auth > Browse for your `.ppk` file
   - Click "Open"

4. **Verify Docker installation:**
   ```bash
   # Wait 2-3 minutes after launch for user-data script to complete
   # Check if setup is done
   cat setup-done.txt
   
   # Test Docker
   docker --version
   docker-compose --version
   
   # If docker-compose not found, log out and back in:
   exit
   # Then reconnect with SSH command
   ```

### Step 3: Deploy Your Application

1. **Clone your repository:**
   ```bash
   # SSH into your EC2 instance first
   git clone https://github.com/yourusername/webdev-express.git
   cd webdev-express
   ```

   **If you don't have a repo yet:**
   ```bash
   # Option A: Create files manually
   mkdir -p webdev-express/backend
   cd webdev-express
   nano docker-compose.yml
   # Paste your docker-compose.yml content, Ctrl+X to save
   
   # Option B: Use SCP to copy files from local
   # On your LOCAL machine (new terminal):
   scp -i "todo-app-key.pem" -r /path/to/webdev-express ubuntu@your-ec2-public-dns:~/
   ```

2. **Start the application:**
   ```bash
   cd webdev-express
   docker-compose up -d
   ```

3. **Check if it's running:**
   ```bash
   # View running containers
   docker-compose ps
   
   # Should show:
   # NAME              STATUS          PORTS
   # todo-backend      Up 10 seconds   0.0.0.0:3000->3000/tcp
   # todo-postgres     Up 20 seconds   0.0.0.0:5432->5432/tcp
   
   # View logs
   docker-compose logs -f
   # Press Ctrl+C to exit logs
   ```

### Step 4: Test Your Deployment

1. **Get your public IP:**
   - Go to EC2 Console
   - Select your instance
   - Copy the **Public IPv4 address** (e.g., `54.123.45.67`)

2. **Test the API:**
   
   **In your browser:**
   ```
   http://YOUR-EC2-PUBLIC-IP:3000/todos
   ```
   
   **Or use curl:**
   ```bash
   curl http://YOUR-EC2-PUBLIC-IP:3000/todos
   ```

3. **You should see JSON response:**
   ```json
   [
     {
       "id": 1,
       "text": "Buy groceries",
       "completed": true,
       "created_at": "...",
       "updated_at": "..."
     }
   ]
   ```

**🎉 Success! Your app is now running on AWS!**

---

## Testing Your Deployment

### Basic API Tests

**Get all todos:**
```bash
curl http://YOUR-EC2-IP:3000/todos
```

**Create a todo:**
```bash
curl -X POST http://YOUR-EC2-IP:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Deployed to AWS!"}'
```

**Update a todo:**
```bash
curl -X PUT http://YOUR-EC2-IP:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**Delete a todo:**
```bash
curl -X DELETE http://YOUR-EC2-IP:3000/todos/1
```

**Count todos:**
```bash
curl http://YOUR-EC2-IP:3000/todos/count
```

### Testing from Frontend

If you deployed the frontend, update `frontend/src/App.jsx`:

```javascript
// Change this line:
const API_URL = 'http://localhost:3000'

// To this:
const API_URL = 'http://YOUR-EC2-PUBLIC-IP:3000'
```

Then test the full application!

---

## Troubleshooting

### Cannot Connect to EC2 Instance

**Problem**: `Connection timed out` or `Connection refused`

**Solutions:**
1. Check security group allows SSH (port 22) from your IP
2. Verify instance is running (EC2 Console)
3. Check you're using the correct `.pem` file
4. Ensure your IP hasn't changed (update security group)
5. Try `ping YOUR-EC2-IP` to check connectivity

### Cannot Access API on Port 3000

**Problem**: Browser shows "Can't reach this page"

**Solutions:**
1. Check security group allows port 3000 from 0.0.0.0/0
2. Verify Docker containers are running: `docker-compose ps`
3. Check backend logs: `docker-compose logs backend`
4. Test from EC2 itself: `curl http://localhost:3000/todos`
5. Ensure you're using HTTP not HTTPS

### Database Connection Errors

**Problem**: Backend logs show "Connection refused" or "Authentication failed"

**Solutions:**
1. Check PostgreSQL container is running: `docker-compose ps`
2. View PostgreSQL logs: `docker-compose logs postgres`
3. Verify DB is healthy: `docker exec -it todo-postgres psql -U todouser -d tododb`
4. Restart containers: `docker-compose restart`

### Docker Compose Not Found

**Problem**: `docker-compose: command not found`

**Solution:**
```bash
# Install Docker Compose manually
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version

# Or use docker compose (no hyphen) instead
docker compose up -d
```

### Permission Denied (Docker)

**Problem**: `permission denied while trying to connect to the Docker daemon socket`

**Solution:**
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and log back in
exit
# Then SSH back in

# Or use sudo temporarily
sudo docker-compose up -d
```

### Out of Memory / Instance Freezing

**Problem**: EC2 instance becomes unresponsive

**Solution:**
```bash
# Check memory usage
free -h

# If using t2.micro and running out of memory:
# Option A: Upgrade to t3.small
# Option B: Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Containers Keep Restarting

**Problem**: `docker-compose ps` shows containers restarting

**Solution:**
```bash
# Check logs for errors
docker-compose logs backend
docker-compose logs postgres

# Common issues:
# - Wrong environment variables
# - Port already in use
# - Database not ready (increase healthcheck wait time)
```

---

## Useful Commands Reference

### Docker Management
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Restart services
docker-compose restart
docker-compose restart backend

# Stop everything
docker-compose down

# Start everything
docker-compose up -d

# Rebuild and restart
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v

# Execute commands in container
docker exec -it todo-backend sh
docker exec -it todo-postgres psql -U todouser -d tododb
```

### EC2 Management
```bash
# Check disk space
df -h

# Check memory
free -h

# Check running processes
htop
# Or: top

# System logs
sudo journalctl -xe

# Check open ports
sudo netstat -tulpn | grep LISTEN
```

### PostgreSQL Commands
```bash
# Connect to database
docker exec -it todo-postgres psql -U todouser -d tododb

# Once connected:
\dt                    # List tables
\d todos              # Describe todos table
SELECT * FROM todos;  # Query data
\q                    # Quit
```

---

## Cleanup (Important!)

**⚠️ Don't forget to clean up resources to avoid charges!**

### Option 1: Stop Resources (Keep for Later)

**Stop EC2 Instance:**
1. EC2 Console > Instances
2. Select your instance
3. Instance state > **Stop instance**
4. Costs: ~$0/month (only for EBS storage, ~$2/month for 20GB)

### Option 2: Delete Everything (Permanent)

**Terminate EC2 Instance:**
1. EC2 Console > Instances
2. Select your instance
3. Instance state > **Terminate instance**
4. Confirm termination
5. Wait a few minutes

**Delete Security Groups:**
1. EC2 Console > Security Groups
2. Select `todo-app-sg`
3. Actions > **Delete security groups**

**Delete Key Pairs:**
1. EC2 Console > Key Pairs
2. Select `todo-app-key`
3. Actions > **Delete**

---

## 💰 Cost Estimation

**Free Tier (First 12 months):**
- EC2 t2.micro: **FREE** (750 hours/month)
- EBS Storage 20GB: **FREE** (30 GB included)
- Data Transfer: **FREE** (15 GB/month)

**After Free Tier:**
- EC2 t3.micro: ~$7.50/month
- EBS Storage 20GB: ~$2/month
- **Total**: ~$9.50/month

> 💡 **Teaching Tip**: Create resources before class, demonstrate, then delete immediately after. Total cost: < $1!

---

## 🎓 Teaching Tips

### For the Classroom

1. **Pre-setup:**
   - Create EC2 instance before class with Docker pre-installed
   - Have code ready to clone (GitHub/GitLab)
   - Test connection beforehand

2. **During class:**
   - Screen share the AWS Console (very visual!)
   - Show each step in browser
   - Let students follow along on their own AWS accounts
   - Encourage students to test the API from their phones

3. **Time management:**
   - **Full deployment**: 30-45 minutes (perfect for teaching)

4. **Student exercises:**
   - Deploy their own versions
   - Modify the application and redeploy
   - Test the API from their phones (mobile browser)
   - Compare local vs cloud performance

### Common Student Questions

**Q: Why is it so slow to access?**
A: Network latency, server location, free tier resources. Discuss CDNs and regional deployment.

**Q: Can anyone access my API?**
A: Yes! That's why we add authentication in production. Discuss API keys, JWT, OAuth.

**Q: What if I forget to stop my instances?**
A: AWS Free Tier has limits. Set up billing alerts! Show them Cost Explorer.

**Q: How do I add HTTPS?**
A: Use CloudFront, Application Load Balancer, or Nginx with Let's Encrypt. Advanced topic.

**Q: How do I connect my frontend?**
A: Change API_URL to EC2 public IP. Discuss CORS if issues arise.

**Q: My IP keeps changing, how do I fix URLs?**
A: Use Elastic IP (costs $0 when attached, $0.005/hour when not). Or use Route 53 for DNS.

---

## 🚀 Next Steps

**To make this production-ready:**

1. **Domain Name**: Register domain with Route 53
2. **HTTPS**: Set up SSL with ACM + ALB
3. **Auto Scaling**: Use Auto Scaling Groups
4. **Load Balancer**: Application Load Balancer
5. **Monitoring**: CloudWatch dashboards and alarms
6. **CI/CD**: GitHub Actions + AWS CodeDeploy
7. **Database**: Consider migrating to Amazon RDS for managed PostgreSQL
8. **Backup**: Automated snapshots and backups
9. **Security**: WAF, Secrets Manager, IAM roles

**Alternative Deployment Options:**
- ECS (Elastic Container Service) - More AWS-native
- EKS (Elastic Kubernetes Service) - Industry standard for containers
- App Runner - Simplest option (no server management)
- Elastic Beanstalk - Platform as a Service
- Lambda + API Gateway - Serverless

---

## 📚 Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker on AWS](https://aws.amazon.com/docker/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

**Good luck with your deployment! 🎉**

Remember: Always delete resources after teaching to avoid unexpected charges!

