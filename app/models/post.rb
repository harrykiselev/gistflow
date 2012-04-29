class Post < ActiveRecord::Base
  include Models::Likable
  include Models::Notifiable
  include Models::Taggable
  include Models::Searchable unless Rails.env.test?
  
  belongs_to :user, inverse_of: :posts
  has_many :comments
  
  default_scope order: 'posts.id desc'
  
  validates :user, :title, presence: true
  validates :cuts_count, inclusion: { in: [0, 1] }
  validates :preview, length: 3..500
  validates :tags_size, numericality: { greater_than: 0 }
  validates :status, format: { with: /http:\/\/goo.gl\/xxxxxx/ }, 
    length: { maximum: 140 }, if: :status?
  
  attr_accessor :status
  attr_accessible :title, :content, :question, :status
  
  after_create :tweet
  after_save :cache
  after_destroy :clear_cache
  
  def link_name
    ln = title.blank? ? preview : title
    ln[0..30].strip
  end
  
  def preview
    content_parts.first.to_s.strip
  end
  
  def body
    content.to_s.gsub('<cut>', "\r\n")
  end
  
  def tags_size
    raw = Replaceable.new(content)
    raw.tagnames.size
  end
  
  def status?
    status.present?
  end
  
  def formatted_preview(reload = false)
    @formatted_preview = nil if reload
    @formatted_preview ||= Markdown.markdown begin
      raw = Replaceable.new(preview)
      raw.replace_gists!.replace_tags!.replace_usernames!
      raw.to_s
    end
  end
  
protected
  
  def cuts_count
    if content.blank?
      0
    elsif content == '<cut>'
      1
    else
      content.split('<cut>').size - 1
    end
  end
  
  def content_parts
    @content_parts ||= content.to_s.split('<cut>', 2)
  end
  
  def tweet
    if user.twitter_client? && status.present?
      url = Googl.shorten("http://gistflow.com/posts/#{id}")
      status.gsub!('http://goo.gl/xxxxxx', '')
      status << url.short_url
      user.twitter_client.update(status)
    end
  end
  
  def cache
    $redis.set cache_key(:preview), formatted_preview
  end
  
  def clear_cache
    $redis.del cache_key
  end
  
  def cache_key(*paths)
    [:posts, id, paths].flatten.compact.join(':')
  end
end
