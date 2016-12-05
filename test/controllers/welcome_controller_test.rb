require 'test_helper'

class WelcomeControllerTest < ActionController::TestCase
end
class WelcomeControllerTest2 < ActionDispatch::IntegrationTest

  test "User Login (Invalid Username)" do
    post login_path, :nickname => "AlexFalse!", :password => "testing"
    assert_response :redirect
    follow_redirect!
    assert_template 'welcome/index'
    assert_not session[:id]
  end

  test "User Login (Invalid Password)" do
    post login_path, :nickname => "Alex", :password => "testingFalse!"
    assert_response :redirect
    follow_redirect!
    assert_template 'welcome/index'
    assert_not session[:id]
  end

  test "User Login (Success)" do
    post login_path, :nickname => "Alex", :password => "testing"
    assert_response :redirect
    follow_redirect!
    assert_template 'users/show'
    assert session[:id]
  end

end
