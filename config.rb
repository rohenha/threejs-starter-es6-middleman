
########################
#
# Site setting
#
########################
config[:site_url] = 'http://example.com'
config[:site_name] = 'Example Site Name'
config[:site_description] = 'Example Site Description.'
config[:site_keywords] = 'site keywords, hogehoge, fugafuga'
config[:site_author] = 'Author Name'
config[:site_local] = 'en_US'
config[:site_page_type] = 'article'
config[:site_color] = '#4285f4'
config[:site_image] = 'assets/images/image.jpg'
config[:twitter_card] = 'summary_large_image'

########################
#
# Setting of Autoprefixer
#
########################
activate :autoprefixer do |config|
    config.browsers = ['last 3 versions']
    config.flexbox = true
    config.grid = true
    config.inline = true
end

activate :directory_indexes
# activate :sprockets
activate :relative_assets
activate :i18n, langs: [:en, :fr]
# activate :gdpr

page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false
page '/templates/*.erb', layout: false
page '/components/*.erb', layout: false
page '/sitemap.xml', :layout => false
# sprockets.append_path File.join(root, 'bower_components')
# sprockets.append_path File.join(root, 'node_modules')

########################
#
# Folders paths
#
########################
set :relative_links, true
set :strip_index_file, true
set :trailing_slash,   true
set :css_dir, 'assets/styles'
set :js_dir, 'assets/javascripts'
set :images_dir, 'assets/images'
set :fonts_dir, 'assets/fonts'

if build? || server?
  activate(
    :external_pipeline,
    name: :gulp,
    command: build? ? 'npm run build' : 'npm run start',
    source: 'tmp',
    latency: 1
  )
end