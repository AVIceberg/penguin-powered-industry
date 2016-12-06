class Building < ActiveRecord::Base
  #belongs_to :user
  # DEFUNCT - TO be removed

  validates :max_generation,
  numericality: {only_integer: true, greater_than: 0}

  validates :capacity,
  numericality: {only_integer: true, greater_than: 0}
end
