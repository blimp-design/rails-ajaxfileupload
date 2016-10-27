# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rails/ajaxfileupload/version'

Gem::Specification.new do |spec|
  spec.name          = "rails-ajaxfileupload"
  spec.version       = Rails::AjaxFileUpload::VERSION
  spec.authors       = ["Kedar Vaidya"]
  spec.email         = ["kedar@blimp.co.in"]

  spec.summary       = %q{Enables file uploads when remote = true}
  spec.description   = %q{Enables file uploads when remote = true}
  spec.license       = "MIT"

  spec.files         = Dir["{lib,vendor}/**/*"] + ["LICENSE", "README.md"]
  spec.require_paths = ["lib"]

  spec.add_dependency "railties", ">= 4.0"

  spec.add_development_dependency "bundler"
  spec.add_development_dependency "rake"
end
