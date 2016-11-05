require 'test_helper'

class UsersControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get signup_path
    assert_response :success
  end

  test "valid signup and redirect" do
  	get signup_path
  	assert_difference 'User.count', 1 do
  		post users_path,  user: { fname: "tester22", lname: "tester22", nickname: "tester22", email: "tester@testers.com",
  											password: "testers", password_confirmation: "testers" } 
  	end
  	follow_redirect!
  	assert_template 'users/show'
  end

end
