# Monitoring and Alerts Setup Guide

## Purpose
This document provides comprehensive guidance for setting up monitoring and alerts for the SSR deployment on Cloud Run and Firebase Hosting. Proper monitoring ensures you can detect and respond to issues quickly, maintain performance standards, and control costs.

## Overview

The monitoring setup includes:
- Cloud Run performance metrics (requests, errors, latency)
- Firebase Hosting metrics (bandwidth, requests)
- Alert policies for error rates, latency, and costs
- Monitoring dashboards for visualization
- Notification channels for alerts

## Prerequisites

- Google Cloud project with Cloud Run service deployed
- Firebase project with Hosting configured
- gcloud CLI installed and authenticated
- Appropriate IAM permissions (Monitoring Admin, Monitoring Alert Policy Editor)

## Cloud Run Monitoring

### Key Metrics to Monitor

1. **Request Count**: Total number of requests received
   - Metric: `run.googleapis.com/request_count`
   - Good for: Understanding traffic patterns

2. **Request Latency**: Time to process requests
   - Metric: `run.googleapis.com/request_latencies`
   - Target: <2 seconds (95th percentile)

3. **Error Rate**: Percentage of failed requests (5xx errors)
   - Metric: `run.googleapis.com/request_count` (filtered by response_code_class="5xx")
   - Target: <1% of total requests

4. **Instance Count**: Number of running container instances
   - Metric: `run.googleapis.com/container/instance_count`
   - Good for: Understanding scaling behavior

5. **CPU Utilization**: CPU usage per instance
   - Metric: `run.googleapis.com/container/cpu/utilizations`
   - Target: <80% average

6. **Memory Utilization**: Memory usage per instance
   - Metric: `run.googleapis.com/container/memory/utilizations`
   - Target: <80% average

7. **Cold Start Count**: Number of cold starts
   - Metric: `run.googleapis.com/container/startup_latencies`
   - Target: <5 seconds startup time

### Accessing Cloud Run Metrics

**Via Cloud Console:**
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your service (`portfolio-website`)
3. Click on the "Metrics" tab
4. View request count, latency, error rate, and instance count

**Via Metrics Explorer:**
1. Go to [Metrics Explorer](https://console.cloud.google.com/monitoring/metrics-explorer)
2. Select resource type: "Cloud Run Revision"
3. Select metric (e.g., `run.googleapis.com/request_count`)
4. Filter by service name: `portfolio-website`
5. Customize time range and aggregation

### Creating a Cloud Run Dashboard

1. Go to [Monitoring Dashboards](https://console.cloud.google.com/monitoring/dashboards)
2. Click "Create Dashboard"
3. Name it "SSR Portfolio - Cloud Run"
4. Add charts for key metrics:

**Chart 1: Request Rate**
- Resource: Cloud Run Revision
- Metric: `run.googleapis.com/request_count`
- Aggregation: Rate (requests/second)
- Filter: `service_name="portfolio-website"`

**Chart 2: Request Latency (95th Percentile)**
- Resource: Cloud Run Revision
- Metric: `run.googleapis.com/request_latencies`
- Aggregation: 95th percentile
- Filter: `service_name="portfolio-website"`

**Chart 3: Error Rate**
- Resource: Cloud Run Revision
- Metric: `run.googleapis.com/request_count`
- Filter: `service_name="portfolio-website" AND response_code_class="5xx"`
- Aggregation: Rate

**Chart 4: Instance Count**
- Resource: Cloud Run Revision
- Metric: `run.googleapis.com/container/instance_count`
- Filter: `service_name="portfolio-website"`

**Chart 5: CPU Utilization**
- Resource: Cloud Run Revision
- Metric: `run.googleapis.com/container/cpu/utilizations`
- Filter: `service_name="portfolio-website"`
- Aggregation: Mean

**Chart 6: Memory Utilization**
- Resource: Cloud Run Revision
- Metric: `run.googleapis.com/container/memory/utilizations`
- Filter: `service_name="portfolio-website"`
- Aggregation: Mean

5. Save the dashboard

## Alert Policies

### Alert 1: High Error Rate

**Purpose**: Detect when error rate exceeds acceptable threshold

**Configuration:**
- **Condition**: Error rate > 5% of total requests
- **Duration**: 5 minutes
- **Notification**: Email
- **Severity**: Critical

**Setup via gcloud:**
```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cloud Run High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="portfolio-website" AND metric.type="run.googleapis.com/request_count" AND metric.labels.response_code_class="5xx"' \
  --condition-aggregation-per-series-aligner=ALIGN_RATE \
  --condition-aggregation-group-by-fields="resource.service_name"
```

**Response Actions:**
1. Check Cloud Run logs for error details
2. Verify Firestore connectivity
3. Check for recent deployments
4. Review error patterns (specific pages, time of day)
5. Consider rolling back if errors persist

### Alert 2: High Latency

**Purpose**: Detect when response time exceeds performance target

**Configuration:**
- **Condition**: 95th percentile latency > 2 seconds
- **Duration**: 5 minutes
- **Notification**: Email
- **Severity**: Warning

**Setup via gcloud:**
```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cloud Run High Latency" \
  --condition-display-name="Latency > 2 seconds" \
  --condition-threshold-value=2000 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="portfolio-website" AND metric.type="run.googleapis.com/request_latencies"' \
  --condition-aggregation-per-series-aligner=ALIGN_DELTA \
  --condition-aggregation-cross-series-reducer=REDUCE_PERCENTILE_95 \
  --condition-aggregation-group-by-fields="resource.service_name"
```

**Response Actions:**
1. Check Firestore query performance
2. Review Cloud Run instance metrics (CPU, memory)
3. Consider increasing memory/CPU allocation
4. Check for cold starts (may need min-instances > 0)
5. Optimize slow queries or add indexes

### Alert 3: Cost Threshold

**Purpose**: Prevent unexpected cost overruns

**Configuration:**
- **Budget**: $10/month
- **Alerts**: 50%, 90%, 100% of budget
- **Notification**: Email
- **Scope**: Cloud Run + Firebase Hosting

**Setup via Cloud Console:**
1. Go to [Billing Budgets](https://console.cloud.google.com/billing/budgets)
2. Click "Create Budget"
3. Set budget amount: $10/month
4. Set alert thresholds: 50%, 90%, 100%
5. Add email notification
6. Filter by services: Cloud Run, Firebase Hosting
7. Save budget

**Response Actions:**
1. Review Cloud Run request volume
2. Check for unexpected traffic spikes
3. Verify min-instances is set to 0
4. Review Firebase Hosting bandwidth usage
5. Consider implementing rate limiting
6. Adjust budget if traffic growth is expected

### Alert 4: Cold Start Latency (Optional)

**Purpose**: Monitor cold start performance

**Configuration:**
- **Condition**: Cold start latency > 5 seconds
- **Duration**: 5 minutes
- **Notification**: Email
- **Severity**: Warning

**Response Actions:**
1. Consider setting min-instances to 1 during peak hours
2. Optimize Docker image size
3. Review application startup time
4. Consider using Cloud Run's always-allocated CPU

## Firebase Hosting Monitoring

### Key Metrics to Monitor

1. **Bandwidth Usage**: Total data transferred
   - Target: <50 GB/month (to stay within budget)

2. **Request Count**: Number of requests to Firebase Hosting
   - Good for: Understanding CDN cache hit rate

3. **Cache Hit Rate**: Percentage of requests served from CDN
   - Target: >80% for static assets

### Accessing Firebase Hosting Metrics

**Via Firebase Console:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Hosting" in the left sidebar
4. Click on your site
5. View usage metrics (bandwidth, requests)

**Via Google Cloud Console:**
1. Go to [Metrics Explorer](https://console.cloud.google.com/monitoring/metrics-explorer)
2. Select resource type: "Firebase Hosting"
3. Select metric (e.g., `firebasehosting.googleapis.com/network/sent_bytes_count`)
4. Customize time range and aggregation

### Firebase Hosting Dashboard

Add Firebase Hosting metrics to your monitoring dashboard:

**Chart 7: Bandwidth Usage**
- Resource: Firebase Hosting
- Metric: `firebasehosting.googleapis.com/network/sent_bytes_count`
- Aggregation: Sum
- Time range: Last 30 days

**Chart 8: Request Count**
- Resource: Firebase Hosting
- Metric: `firebasehosting.googleapis.com/network/request_count`
- Aggregation: Sum

## Notification Channels

### Email Notifications

**Setup:**
1. Go to [Notification Channels](https://console.cloud.google.com/monitoring/alerting/notifications)
2. Click "Add New"
3. Select "Email"
4. Enter email address
5. Click "Save"

**Best Practices:**
- Use a team email or distribution list
- Set up multiple channels for redundancy
- Test notifications after setup

### Slack Notifications (Optional)

**Setup:**
1. Create a Slack webhook URL in your Slack workspace
2. Go to [Notification Channels](https://console.cloud.google.com/monitoring/alerting/notifications)
3. Click "Add New"
4. Select "Slack"
5. Enter webhook URL
6. Click "Save"

### SMS Notifications (Optional)

**Setup:**
1. Go to [Notification Channels](https://console.cloud.google.com/monitoring/alerting/notifications)
2. Click "Add New"
3. Select "SMS"
4. Enter phone number
5. Click "Save"

**Note**: SMS notifications may incur additional costs

## Automated Setup

Use the provided script to automate monitoring setup:

```bash
# Run the monitoring setup script
./scripts/setup-monitoring.sh
```

The script will:
1. Verify Cloud Run service exists
2. Create email notification channel
3. Create alert policies for error rate and latency
4. Provide links to configure budget alerts
5. Display next steps

## Manual Setup Steps

If you prefer manual setup or the script fails:

### 1. Create Notification Channel

```bash
gcloud alpha monitoring channels create \
  --display-name="SSR Alerts Email" \
  --type=email \
  --channel-labels=email_address=YOUR_EMAIL@example.com
```

### 2. Get Channel ID

```bash
gcloud alpha monitoring channels list
```

### 3. Create Alert Policies

Use the gcloud commands provided in the Alert Policies section above, replacing `CHANNEL_ID` with your actual channel ID.

### 4. Create Dashboard

Follow the steps in the "Creating a Cloud Run Dashboard" section above.

### 5. Set Up Budget Alerts

Follow the steps in the "Alert 3: Cost Threshold" section above.

## Monitoring Best Practices

1. **Review metrics regularly**: Check dashboard at least weekly
2. **Set realistic thresholds**: Adjust alert thresholds based on actual traffic patterns
3. **Test alerts**: Trigger test alerts to verify notification delivery
4. **Document incidents**: Keep a log of alerts and resolutions
5. **Tune over time**: Adjust thresholds and metrics as you learn normal behavior
6. **Monitor costs**: Review billing reports monthly
7. **Set up uptime checks**: Use Cloud Monitoring uptime checks for availability monitoring
8. **Enable Cloud Logging**: Ensure logs are being collected for troubleshooting

## Uptime Checks (Optional)

Create an uptime check to monitor availability:

1. Go to [Uptime Checks](https://console.cloud.google.com/monitoring/uptime)
2. Click "Create Uptime Check"
3. Configure:
   - **Title**: Portfolio Website Uptime
   - **Protocol**: HTTPS
   - **Resource Type**: URL
   - **Hostname**: your-domain.web.app
   - **Path**: /
   - **Check frequency**: 1 minute
4. Set up alert policy for uptime check failures
5. Save

## Log-Based Metrics (Advanced)

Create custom metrics from logs:

**Example: Track specific error types**

1. Go to [Logs Explorer](https://console.cloud.google.com/logs)
2. Create a filter for specific errors
3. Click "Create Metric"
4. Configure metric (counter, distribution, etc.)
5. Use metric in dashboards and alerts

## Troubleshooting

### Alert Not Firing

**Possible causes:**
- Threshold not reached
- Duration too long
- Notification channel not configured
- Alert policy disabled

**Solutions:**
1. Check alert policy status
2. Verify notification channel is verified
3. Review metric data in Metrics Explorer
4. Test with lower threshold temporarily

### Missing Metrics

**Possible causes:**
- Service not deployed
- Metrics not enabled
- Insufficient permissions
- Metric delay (up to 3 minutes)

**Solutions:**
1. Verify service is running
2. Check IAM permissions
3. Wait a few minutes for metrics to appear
4. Enable Cloud Monitoring API

### High Costs

**Possible causes:**
- Unexpected traffic spike
- Min-instances set too high
- Memory/CPU allocation too high
- Inefficient queries causing long execution times

**Solutions:**
1. Review traffic patterns
2. Set min-instances to 0
3. Optimize resource allocation
4. Add Firestore indexes
5. Implement caching

## Cost Estimates

### Cloud Monitoring Costs

- **Metrics ingestion**: First 150 MB/month free, then $0.2580/MB
- **API calls**: First 1 million calls/month free, then $0.01/1000 calls
- **Logs ingestion**: First 50 GB/month free, then $0.50/GB

**Expected costs for this deployment**: $0/month (within free tier)

### Alert Notification Costs

- **Email**: Free
- **SMS**: Varies by provider
- **Slack**: Free (webhook)

## Next Steps

After setting up monitoring:

1. ✅ Run `./scripts/setup-monitoring.sh` to automate setup
2. ✅ Create Cloud Run dashboard with key metrics
3. ✅ Set up budget alerts in Cloud Console
4. ✅ Configure Firebase Hosting monitoring
5. ✅ Test alert notifications
6. ✅ Document alert response procedures
7. ✅ Schedule regular monitoring reviews
8. ✅ Set up uptime checks (optional)

## References

- [Cloud Run Monitoring](https://cloud.google.com/run/docs/monitoring)
- [Cloud Monitoring Documentation](https://cloud.google.com/monitoring/docs)
- [Alert Policies](https://cloud.google.com/monitoring/alerts)
- [Firebase Hosting Metrics](https://firebase.google.com/docs/hosting/usage-quotas-pricing)
- [Budget Alerts](https://cloud.google.com/billing/docs/how-to/budgets)
