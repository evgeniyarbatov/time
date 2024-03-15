variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "domain_name" {
  type    = string
  default = "arbatov.me"
}

variable "bucket_name" {
  type    = string
  default = "arbatov.me-clock-set"
}

variable "path_name" {
  type    = string
  default = "clocks"
}