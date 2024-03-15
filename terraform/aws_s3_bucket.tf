resource "aws_s3_bucket" "website" {
  bucket = var.bucket_name
}

resource "aws_s3_object" "static_files" {
  for_each     = fileset(local.website_dir, "**")
  bucket       = aws_s3_bucket.website.id
  key          = each.key
  source       = "${local.website_dir}/${each.value}"
  content_type = lookup(local.content_types, regex("\\.[^.]+$", each.value), null)
  etag         = filemd5("${local.website_dir}/${each.value}")
}