require 'test_helper'

class GameControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end

  test "Clicking Area Generated" do
    session[:id] = users(:Alex).id
    get :gamepage
    assert_select '#clicking-area'
  end

  test "Save button exists" do
    session[:id] = users(:Alex).id
    get :gamepage
    assert_select '#save-button'
  end

  test "Clock-specific HTML exists" do
    session[:id] = users(:Alex).id
    get :gamepage
    assert_select 'div.timer'
    assert_select 'span#minutes'
    assert_select 'span#seconds'
  end

end
