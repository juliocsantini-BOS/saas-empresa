output "alb_dns_name" { value = aws_lb.this.dns_name }
output "rds_endpoint" { value = aws_db_instance.postgres.address }
output "redis_endpoint" { value = aws_elasticache_cluster.redis.cache_nodes[0].address }
output "ecr_api_repo" { value = aws_ecr_repository.api.repository_url }
output "ecr_worker_repo" { value = aws_ecr_repository.worker.repository_url }
