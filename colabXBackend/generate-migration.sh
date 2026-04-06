#!/bin/bash
# Generate the correct migration for dropping partnerScore and performanceMetric tables

cd d:/ColabX/colabXBackend

# Generate migration based on schema changes
npx drizzle-kit generate:pg --name drop_performance_tables

