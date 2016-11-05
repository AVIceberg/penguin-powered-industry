require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  test "should get new" do
    get :new
    assert_response :success
  end
=begin
#under construction
  test "valid signup and redirect" do
  	get :new
  	assert_difference 'User.count', 1 do
  		post :create, params: { user: { fname: "tester22", lname: "tester22", nickname: "tester22", email: "tester@testers.com",
  											password: "testers", password_confirmation: "testers" } }
  	end
  	follow_redirect!
  	assert_template 'users/profile'
  end
=end
end
