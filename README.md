# Run minio-storage

Start minio-storage

## Start minio-storage

```
docker-compose up -d minio-storage
```


# Create minio service account

Create minio service account

## Login minio console

http://localhost:9001

| Input | Value |
| --- | --- |
| User | admin |
| Password | changeme |

## Create service account

Identity > Service Accounts

[button] Create service account

[button] Create

[button] Download for import or Copy Access Key and Secret Key values


# Set environment variables

Copy "sample.env" file to ".env" file

Edit ".env" file

| Env. | Description |
| --- | --- |
| MINIO_HOST | minio service ip or domain |
| MINIO_PORT | minio service port |
| MINIO_USE_SSL | true or false |
| MINIO_ACCESS_KEY | value from minio service account - should be set |
| MINIO_SECRET_KEY | value from minio service account - should be set |

ex)
```
# MINIO_HOST=minio-storage
# MINIO_PORT=9000
# MINIO_USE_SSL=false
MINIO_ACCESS_KEY=nHLYz20rWH0s21rU
MINIO_SECRET_KEY=Fk9gNSbr9pTtRZefXkldpvXMrIPRcMsD
```

# Launch app

```
docker-compose up -d
```

# Test

http://localhost:3000