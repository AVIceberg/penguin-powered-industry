class User < ActiveRecord::Base

  before_save {self.email = email.downcase}
  # names should not be empty
  validates :fname, :lname, :nickname, presence: true, length: {maximum:50}
  validates :nickname, :uniqueness => {:message => "already taken"}

  #regular expression for email
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  # email should not be empty
  validates :email, presence: true, lenght: {maximum: 255}, format: {with: VALID_EMAIL_REGEX}, :uniqueness => {case_sensitive => false, message => "has been registered"}

  has_secure_password

end
