require 'test_helper'
require 'json'

class GameControllerTest < ActionController::TestCase
  # test "the truth" do
  #   assert true
  # end

  # test "Clicking Area Generated" do
  #   session[:id] = users(:Alex).id
  #   get :gamepage
  #   assert_select '#clicking-area'
  # end

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
  
  test "newly created building map save" do
    session[:id] = users(:Cat).id
    get :save, leveledUp: "false", max: users(:Cat).max, toys: users(:Cat).toys, time_left: users(:Cat).timeleft, map: users(:Cat).map.to_json, building_map: users(:Cat).building_map.to_json
    assert_response :success
  end

end
