require 'test_helper'


class UsersControllerTest < ActionController::TestCase

  test "should get new" do
    get :new
    assert_response :success
  end

  test "enter user list" do
    #@user.save
    session[:id]= users(:Alex).id
    get :index
    assert_response :success

  end

  test "Valid Edit Page Request" do
    session[:id]= users(:Kate).id
    get :edit , id: session[:id]
    assert_response :success
    assert_template 'users/edit'
  end

  test "Admin can access other edit pages" do
    session[:id] = users(:Kate).id
    get :edit, id: 1
    assert_template 'users/edit'
  end

  test "Users cannot access other peoples' edit pages" do
    session[:id] = users(:Alex).id
    get :edit, id: 0
    assert_response :redirect
  end

  test "Admins can access other peoples' edit pages" do
    session[:id] = users(:Kate).id
    get :edit, id: 1
    assert_response :success
  end

  test "Check user list loads" do
    get :index, id: users(:Kate)
    assert_response :success
    assert_select 'tr', User.all.count + 1
  end

end

class UsersControllerTest1 < ActionDispatch::IntegrationTest

  test "Valid signup and Redirect" do
  	get signup_path
  	assert_difference 'User.count', 1 do
  		post users_path,  user: { fname: "tester22", lname: "tester22", nickname: "tester22", email: "tester@testers.com",
  											password: "testers", password_confirmation: "testers" }
  	end
  	follow_redirect!
  	assert_template 'users/show'
  end

  test "User logout" do
    get root_path
    post login_path, :nickname => "Kate", :password => "testing"
    follow_redirect!
    assert_template 'users/show'
    assert session[:id] == users(:Kate).id
    delete logout_application_path
    assert_not session[:id]
  end

  test "Invalid Profile Edit" do
    get root_path
    post login_path, :nickname => "Alex", :password => "testing"
    follow_redirect!
    assert_template 'users/show'
    get edit_user_path, id: session[:id]
    assert_response :success
    put user_path, user: { fname: "Alex", lname: "Zheng", nickname: "Alex", email: "a"}
    assert_template 'users/edit'
    assert User.find_by_id(session[:id]).email != "a"
  end

  test "Valid Profile Edit" do
    get root_path
    post login_path, :nickname => "Alex", :password => "testing"
    follow_redirect!
    assert_template 'users/show'
    get edit_user_path, id: session[:id]
    assert_response :success
    put user_path, user: { fname: "Alex", lname: "Zheng", nickname: "Alex", email: "a@a.com"}
    assert_response :redirect
    assert User.find_by_id(session[:id]).email == "a@a.com"
  end

  test "Invalid Admin Profile Edit" do
    get root_path
    post login_path, :nickname => "Kate", :password => "testing"
    follow_redirect!
    assert_template 'users/show'
    get edit_user_path, id: users(:Alex).id #Not Kate's ID
    assert_response :success
    put user_path, user: { fname: "Alex", lname: "Zheng", nickname: "Alex", email: "a", id: users(:Alex).id}
    assert_template 'users/edit'
    assert User.find_by_id(users(:Alex).id).email != "a"
  end

  test "Valid Admin Profile Edit" do
    get root_path
    post login_path, :nickname => "Kate", :password => "testing"
    follow_redirect!
    assert_template 'users/show'
    get edit_user_path, id: users(:Alex).id #Not Kate's ID
    assert_response :success
    put user_path, user: { fname: "Alex", lname: "Zheng", nickname: "Alex", email: "a@a.com", id: users(:Alex).id }
    assert_response :redirect
    #assert User.find_by_id(users(:Alex).id).email == "a@a.com"
  end

end
