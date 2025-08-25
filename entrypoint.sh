#!/bin/bash
# ENVIRONMENT=$1
# # Determine the environment and set S3 paths accordingly
# case "$ENVIRONMENT" in
#   "dev")
#     ENV_FILE_BUCKET="duploservices-dev-configs-new-167414264568/rean-admin-portal"
#     CONSTANTS_FILE_BUCKET="duploservices-dev-configs-new-167414264568/rean-admin-portal"
#     FAVICON_FILE_BUCKET="duploservices-dev-configs-new-167414264568/rean-admin-portal"
#     ;;
#   "uat")
#     ENV_FILE_BUCKET="duploservices-uat-configs-new-167414264568/rean-admin-portal"
#     CONSTANTS_FILE_BUCKET="duploservices-uat-configs-new-167414264568/rean-admin-portal"
#     FAVICON_FILE_BUCKET="duploservices-uat-configs-new-167414264568/rean-admin-portal"
#     ;;
#   "prod")
#     ENV_FILE_BUCKET="duploservices-prod-configs-new-167414264568/rean-admin-portal"
#     CONSTANTS_FILE_BUCKET="duploservices-prod-configs-new-167414264568/rean-admin-portal"
#     FAVICON_FILE_BUCKET="duploservices-prod-configs-new-167414264568/rean-admin-portal"
#     ;;
#   "aha-prod")
#     ENV_FILE_BUCKET="duploservices-ahaprod-configs-167414264568/rean-admin-portal"
#     CONSTANTS_FILE_BUCKET="duploservices-ahaprod-configs-167414264568/rean-admin-portal"
#     FAVICON_FILE_BUCKET="duploservices-ahaprod-configs-167414264568/rean-admin-portal"
#     ;;
#   "aha-uat")
#     ENV_FILE_BUCKET="duploservices-uat-configs-new-167414264568/rean-admin-portal-aha"
#     CONSTANTS_FILE_BUCKET="duploservices-uat-configs-new-167414264568/rean-admin-portal-aha"
#     FAVICON_FILE_BUCKET="duploservices-uat-configs-new-167414264568/rean-admin-portal-aha"
#     ;;
#   *)
#     echo "Unknown environment: $ENVIRONMENT"
#     exit 1
#     ;;
# esac

# Download files from Azure Storage
az storage blob download --container-name $CONTAINER_NAME --name .env --file /app/.env --account-name $ACCOUNT_NAME --account-key $ACCOUNT_KEY
az storage blob download --container-name $CONTAINER_NAME --name constants.ts --file /app/src/lib/constants.ts --account-name $ACCOUNT_NAME --account-key $ACCOUNT_KEY
az storage blob download --container-name $CONTAINER_NAME --name favicon.png --file /app/static/favicon.png

chmod +x ./src/lib/constants.ts
cd /app/build
# Add any other scripts here...

# Start the service
# npm run start
node index.js
