require 'test_helper'

class WelcomeControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end

  setup do

    @user1 = User.new(fname: "Example", lname: "User", nickname: "Demo", email: "user@example.com", password: "tested", password_confirmation: "tested", level: 1, max: 0)
    @user1.save

  end


  test "the user who want to login should have already sign up with a user name" do

     get :login, :nickname => "Dem"
     assert_not_equal  flash[:danger], "Login failed. Invalid username."


  end

  test "match the username and pass" do

     get :login, :nickname => "Demo", :password => "teste"
     assert_not_equal  flash[:danger], "Login failed. Invalid password."

  end

end
