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
    assert_equal users(:Cat).building_map, 0
    session[:id] = users(:Cat).id
    building = users(:Cat).building_map
    get :save, leveledUp: "false", max: users(:Cat).max, toys: users(:Cat).toys, time_left: users(:Cat).timeleft, map: users(:Cat).map.to_json, building_map: building.to_json
    assert_response :success
    count = 0
    (0..7).each do |i|
      (0..7).each do |j|
        if building[i][j] != "0"
          count = count + 1
        end
      end
    end
    assert_equal users(:Cat).map, 0
  end

end
