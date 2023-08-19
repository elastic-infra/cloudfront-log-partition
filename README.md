# cloudfront-log-partition

![GitHub](https://img.shields.io/github/license/elastic-infra/cloudfront-log-partition)

[cloudfront-log-partition](https://github.com/elastic-infra/cloudfront-log-partition) published on [AWS Serverless Application Repository](https://serverlessrepo.aws.amazon.com/applications/ap-northeast-1/089928438340/cloudfront-log-partition) packages AWS Lambda Function which partitions CloudFront logs.

This Lambda function supports calls via [Amazon S3 Event Notifications](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html) or [Amazon S3 Batch Operations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/batch-ops.html).

`AWS::Serverless::Function` can only configure S3 Event Notification for S3 bucket created in its template, so you will need to configure S3 Event Notification yourself.
