require 'test_helper'


class UsersControllerTest < ActionController::TestCase

  test "should get new" do
    get :new
    assert_response :success
  end

  test "enter user list" do

    #@user.save
    session[:id]=1
    get :index
    assert_response :success

  end

  test "enter edit page" do

    #@user.save
    session[:id]=0
    get :edit , id: session[:id]
    assert_response :success

  end

  test "edit page is accessible if logged in" do
    session[:id] = 1
    get :edit, id: session[:id]
    assert_template 'users/edit'
  end

  test "edit page for other users is inaccessible" do
    session[:id] = 1
    get :edit, id: 2
    assert_template 'users/show'
  end

end

class UsersControllerTest1 < ActionDispatch::IntegrationTest



  test "valid signup and redirect" do
  	get signup_path
  	assert_difference 'User.count', 1 do
  		post users_path,  user: { fname: "tester22", lname: "tester22", nickname: "tester22", email: "tester@testers.com",
  											password: "testers", password_confirmation: "testers" }
  	end
  	follow_redirect!
  	assert_template 'users/show'
  end



  test "admin user creation works" do

  end

end
