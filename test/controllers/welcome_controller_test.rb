require 'test_helper'

class WelcomeControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end

#<<<<<<< HEAD




end
class WelcomeControllerTest2 < ActionDispatch::IntegrationTest

  setup do

    @user1 = User.new(fname: "Example", lname: "User", nickname: "Demo", email: "user@example.com", password: "tested", password_confirmation: "tested", level: 1, max: 0)
    @user1.save

  end


#=======
  #################################################
  ##Login tests

  ##user:nickname and password: something is created beforehand!

  test "login invalid user" do
    post login_path, nickname: "doesntexist",   password: "testers"
    follow_redirect!
    assert_template 'welcome/index'
  end

  test "login invalid password" do
    post login_path, nickname: "something",    password: "somethings"
    follow_redirect!
    assert_template 'welcome/index'
  end

  test "login works" do
    post login_path, nickname: "Demo",    password: "tested"
    follow_redirect!
    assert_template 'users/show'
  end

#####################################################
  ##Logout testers



#####################################################
  ##User List tests and admin tests to be implemented

#>>>>>>> ecd2744c96b0d8fedfdec685a73d81a774107961
end
