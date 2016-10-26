require 'test_helper'

class UserTest < ActiveSupport::TestCase

  def setup
    @user = User.new(fname: "Example", lname: "User", nickname: "Demo", email: "user@example.com")
  end

  # test for initial setup
  test "should be valid" do
    assert @user.valid?
  end

  #test for the user name
  test "fname should be presnet" do
    @user.fname = "  "
    assert_not @user.valid?
  end
  test "lname should be presnet" do
    @user.lname = "  "
    assert_not @user.valid?
  end
  test "nickname should be presnet" do
    @user.nickname = "  "
    assert_not @user.valid?
  end

  #presence of email
  test "email should be presnet" do
    @user.name = ""
    assert_not @user.valid?
  end

  #length test
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

  # test "the truth" do
  #   assert true
  # end
end
