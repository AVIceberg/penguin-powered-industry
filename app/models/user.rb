class User < ActiveRecord::Base

  before_save {self.email = email.downcase}
  # names should not be empty
  validates :fname, :lname, :nickname, presence: true, length: {maximum:50}
  validates :nickname, :uniqueness => {:message => "already taken"}

  #regular expression for email
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  # email should not be empty
  validates :email,
  presence: true,
  length: {maximum: 255},
  format: {with: VALID_EMAIL_REGEX},
  uniqueness: {case_sensitive: false}

  has_secure_password
  validates :password,
   presence: true,
   length:{minimum: 6},
   if: :password # Will only check validation from forms if password changes

  validates :level,
   numericality: { only_integer: true, greater_than: 0}


end
