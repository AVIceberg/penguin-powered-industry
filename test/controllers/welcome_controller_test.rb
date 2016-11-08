require 'test_helper'

class WelcomeControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end

  #################################################
  ##Login tests

  ##user:nickname and password: something is created beforehand!

  test "login invalid user" do
    post :login, user: { nickname: "doesntexist",
                      password: "testers" }
    follow_redirect!
    assert_template 'welcome/index'
  end

  test "login invalid password" do
    post :login, user: { nickname: "something",
                      password: "somethings" }
    follow_redirect!
    assert_template 'welcome/index'
  end

  test "login works" do
    post :login, user: { nickname: "something",
                      password: "something" }
    follow_redirect!
    assert_template 'users/show'
  end

#####################################################
  ##Logout testers

  test "logout works" do
    session[:id] = 0
    delete :logout_application
    follow_redirect!
    assert_template 'welcome/index'       #assert(if session is defined, login page is NOT accessible);
  end

#####################################################
  ##User List tests and admin tests to be implemented
  
end
