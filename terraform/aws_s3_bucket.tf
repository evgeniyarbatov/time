resource "aws_s3_bucket" "website" {
  bucket = var.bucket_name
}

resource "aws_s3_object" "static_files" {
  depends_on = [ null_resource.update_asset_path ]

  for_each     = fileset(local.website_dir, "**")
  bucket       = aws_s3_bucket.website.id
  key          = each.key
  source       = "${local.website_dir}/${each.value}"
  etag         = filemd5("${local.website_dir}/${each.value}")
}