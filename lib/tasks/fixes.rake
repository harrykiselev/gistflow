namespace :fixes do
  task setup_cache_for_current_posts: :environment do
    Post.all.each(&:save)
  end
end
