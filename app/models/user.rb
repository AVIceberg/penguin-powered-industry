class User < ActiveRecord::Base

  # names should not be empty
  validates :fname, :lname, :nickname, presence: true, length: {maximum:50}
  validates :nickname, :uniqueness => {:message => "already taken"}

  # email should not be empty
  validates :email, presence: true, lenght: {maximum: 255}, :uniqueness => {message => "has been registered"}



end
