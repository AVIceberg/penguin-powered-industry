require 'test_helper'

class UserTest < ActiveSupport::TestCase

  def setup
    @user = User.new(fname: "Example", lname: "User", nickname: "Demo", email: "user@example.com", password: "tested", password_confirmation: "tested", level: 1, max: 0, toys: 0)
  end

  # test for initial setup
  test "should be valid" do
    assert @user.valid?
  end

  #test for the user name
  test "fname should be present" do
    @user.fname = "  "
    assert_not @user.valid?
  end
  test "lname should be present" do
    @user.lname = "  "
    assert_not @user.valid?
  end
  test "nickname should be present" do
    @user.nickname = "  "
    assert_not @user.valid?
  end

  # Level test
  test "level > 1" do
    @user.level = 0
    assert_not @user.valid?
  end

  # Max Tests
  test "max >= 0" do
    assert @user.valid?
    @user.max = -1
    assert_not @user.valid?
    @user.max = 20000000
    assert @user.valid?
  end

  #presence of email
  test "email should be present" do
    @user.email = ""
    assert_not @user.valid?
  end

  #length test (should fail)
  test "fname should not be too long" do
    @user.fname = "a"*51
    assert_not @user.valid?
  end
  test "lname should not be too long" do
    @user.lname = "a"*51
    assert_not @user.valid?
  end
  test "nickname should not be too long" do
    @user.nickname = "a"*51
    assert_not @user.valid?
  end
  test "email should not be too long" do
    @user.email = "a"*244 + "@example.com"
    assert_not @user.valid?
  end

  #validate email format (should be valid)
  test "email validation should accept valid address" do
    valid_address = %w[user@example.com USER@sfu.ca U_SE-RRR@sfu.org.ca first.last@qq.im alex+tom@sample.cn]
    valid_address.each do |valid_address|
      @user.email = valid_address
      assert @user.valid?
      #, "#{invalid_address.inspect} should be invalid"
      # Dont't under stand
    end
  end

  test "email address should be lower case" do
    mixed_case_email = "Foo@ExamPLE.CoM"
    @user.email = mixed_case_email
    @user.save
    assert_equal mixed_case_email.downcase, @user.reload.email
  end

  #test case for uniqueness
  test "email address shoud be unique" do
    duplicated_user = @user.dup
    duplicated_user.email = @user.email.upcase
    @user.save
    assert_not duplicated_user.valid?
  end
  
  test "toys >= 0" do
    assert @user.valid?
    @user.toys = -1
    assert_not @user.valid?
    @user.toys = 8
    assert @user.valid?
  end

  # test "the truth" do
  #   assert true
  # end
end
